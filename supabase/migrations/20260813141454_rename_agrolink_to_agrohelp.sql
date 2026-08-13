-- Keep content consistent with the AgroHelp application name in existing deployments.
UPDATE public.news_items
SET body = REPLACE(body, 'AgroLink', 'AgroHelp')
WHERE body LIKE '%AgroLink%';
