-- 대시보드 매출 추이 RPC (일별 / 주별 / 월별)
-- generate_series로 빈 구간을 0으로 채워 항상 고정 개수 포인트를 반환합니다.

CREATE OR REPLACE FUNCTION public.get_daily_sales(days_back integer DEFAULT 30)
RETURNS TABLE (
  date date,
  sales numeric
)
LANGUAGE sql
STABLE
AS $$
  WITH bounds AS (
    SELECT (timezone('Asia/Seoul', now()))::date AS today
  ),
  days AS (
    SELECT generate_series(
      b.today - (days_back - 1),
      b.today,
      '1 day'::interval
    )::date AS date
    FROM bounds b
  ),
  aggregated AS (
    SELECT
      (o.created_at AT TIME ZONE 'Asia/Seoul')::date AS date,
      SUM(o.total_price)::numeric AS sales
    FROM public.orders o
    CROSS JOIN bounds b
    WHERE (o.created_at AT TIME ZONE 'Asia/Seoul')::date
      BETWEEN b.today - (days_back - 1) AND b.today
    GROUP BY 1
  )
  SELECT
    d.date,
    COALESCE(a.sales, 0)::numeric AS sales
  FROM days d
  LEFT JOIN aggregated a ON a.date = d.date
  ORDER BY d.date;
$$;

CREATE OR REPLACE FUNCTION public.get_weekly_sales(months_back integer DEFAULT 3)
RETURNS TABLE (
  week_start date,
  week_end date,
  sales numeric
)
LANGUAGE sql
STABLE
AS $$
  WITH bounds AS (
    SELECT
      timezone('Asia/Seoul', now()) AS now_seoul,
      date_trunc(
        'week',
        date_trunc(
          'month',
          timezone('Asia/Seoul', now())
            - make_interval(months => months_back)
        )
      )::date AS first_week,
      date_trunc('week', timezone('Asia/Seoul', now()))::date AS last_week
  ),
  weeks AS (
    SELECT generate_series(
      b.first_week,
      b.last_week,
      '1 week'::interval
    )::date AS week_start
    FROM bounds b
  ),
  aggregated AS (
    SELECT
      date_trunc('week', o.created_at AT TIME ZONE 'Asia/Seoul')::date AS week_start,
      SUM(o.total_price)::numeric AS sales
    FROM public.orders o
    CROSS JOIN bounds b
    WHERE (o.created_at AT TIME ZONE 'Asia/Seoul')::date
      >= b.first_week
      AND (o.created_at AT TIME ZONE 'Asia/Seoul')::date
        <= (b.last_week + 6)
    GROUP BY 1
  )
  SELECT
    w.week_start,
    (w.week_start + 6)::date AS week_end,
    COALESCE(a.sales, 0)::numeric AS sales
  FROM weeks w
  LEFT JOIN aggregated a ON a.week_start = w.week_start
  ORDER BY w.week_start;
$$;

CREATE OR REPLACE FUNCTION public.get_monthly_sales(months_back integer DEFAULT 12)
RETURNS TABLE (
  month text,
  sales numeric
)
LANGUAGE sql
STABLE
AS $$
  WITH bounds AS (
    SELECT
      date_trunc('month', timezone('Asia/Seoul', now())) AS this_month
  ),
  months AS (
    SELECT
      to_char(
        generate_series(
          b.this_month - make_interval(months => months_back - 1),
          b.this_month,
          '1 month'::interval
        ),
        'YYYY-MM'
      ) AS month
    FROM bounds b
  ),
  aggregated AS (
    SELECT
      to_char(
        date_trunc('month', o.created_at AT TIME ZONE 'Asia/Seoul'),
        'YYYY-MM'
      ) AS month,
      SUM(o.total_price)::numeric AS sales
    FROM public.orders o
    CROSS JOIN bounds b
    WHERE (o.created_at AT TIME ZONE 'Asia/Seoul')
      >= (b.this_month - make_interval(months => months_back - 1))
    GROUP BY 1
  )
  SELECT
    m.month,
    COALESCE(a.sales, 0)::numeric AS sales
  FROM months m
  LEFT JOIN aggregated a ON a.month = m.month
  ORDER BY m.month;
$$;

GRANT EXECUTE ON FUNCTION public.get_daily_sales(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_weekly_sales(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_monthly_sales(integer) TO authenticated, service_role;
