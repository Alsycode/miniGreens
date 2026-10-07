-- The smoothies removal turned "2 smoothies" + "1 fresh juice" into two juice lines. Fold each
-- plan back into a single line with the combined count (2+1, 4+3, 6+6) so the plan box still
-- offers the same number of drinks and the picker shows one slot group.
update public.subscription_plans set items = array['3 fresh juices', 'Free delivery']
where name = 'Starter' and items = array['2 fresh juices', '1 fresh juice', 'Free delivery'];

update public.subscription_plans set items = array['7 fresh juices', '1 seasonal special']
where name = 'Wellness' and items = array['4 fresh juices', '3 fresh juices', '1 seasonal special'];

update public.subscription_plans set items = array['12 fresh juices', '2 seasonal specials']
where name = 'Family' and items = array['6 fresh juices', '6 fresh juices', '2 seasonal specials'];
