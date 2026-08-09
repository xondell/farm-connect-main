-- Keep the privileged role lookup usable inside RLS policies only.
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;

-- Cover foreign keys used for administrative authorship and ticket messaging.
CREATE INDEX IF NOT EXISTS ticket_messages_author_id_idx ON public.ticket_messages(author_id);
CREATE INDEX IF NOT EXISTS news_items_created_by_idx ON public.news_items(created_by);
CREATE INDEX IF NOT EXISTS inspection_cards_created_by_idx ON public.inspection_cards(created_by);
