TRUNCATE TABLE "public"."guests" CASCADE;
TRUNCATE TABLE "public"."rsvp_items" CASCADE;

INSERT INTO "public"."guests" ("id", "created_at", "updated_at", "guest_name", "contact", "coming", "attendees_count") VALUES 
('25d5d683-2bfd-44cf-a5ed-a6bfce73f0dd', '2025-09-05 08:04:03.518005+00', '2025-09-05 08:04:03.518005+00', 'r o s', 'rh@ros-hartmann.ch', 'true', '1'), 
('3a143567-6ff4-4ce2-b828-fb6e875de816', '2025-09-05 08:04:03.518005+00', '2025-09-05 08:04:03.518005+00', 'Hannes und Dolores', '0787910777', 'true', '2'), 
('5910e53e-e412-4af3-964a-ee76574f8a70', '2025-09-05 08:04:03.518005+00', '2025-09-05 08:04:03.518005+00', 'Cyran Heim', 'cyran.heim@icloud.com', 'true', '1'), 
('9d9229f4-77e7-4321-8a4f-e81b4d79697a', '2025-09-05 08:04:03.518005+00', '2025-09-05 08:04:03.518005+00', 'Vera & Moritz', 'mo.scho@bluewin.ch', 'true', '2'), 
('be9316af-a2a7-4ac8-8105-487c7e732fce', '2025-09-05 08:04:03.518005+00', '2025-09-05 08:04:03.518005+00', 'Silvio & Janni Cavallet', 'sicaja@bluewin.ch', 'true', '2'), 
('f6163208-78e6-4c8d-89f8-2a268237dfdd', '2025-09-05 08:04:03.518005+00', '2025-09-05 08:04:03.518005+00', 'test', 'testmail@kk.ch', 'true', '1');

INSERT INTO "public"."rsvp_items" ("id", "category_id", "item_title", "servings", "diet_tags", "warm_needed", "warm_notes", "brings_utensils", "created_at", "updated_at", "guest_id") VALUES 
('34b6e844-2d87-4606-b7ff-b74b11213646', '51bf1709-c64a-4519-a290-2089100e287b', 'rosse Käseplatte', '1', '{}', 'false', null, 'false', '2025-09-04 17:14:14.055159+00', '2025-09-05 08:04:03.518005+00', '25d5d683-2bfd-44cf-a5ed-a6bfce73f0dd'), 
('49686046-704d-488d-ac03-d132dc406c05', '67016884-af05-4703-b645-49eb1054f3ab', 'test', '1', '{}', 'false', null, 'false', '2025-09-05 07:58:35.28606+00', '2025-09-05 08:04:03.518005+00', 'f6163208-78e6-4c8d-89f8-2a268237dfdd'), 
('4fcbeaa8-467f-4b43-8df5-a38bd200621b', '39e21fa5-458a-4650-89b4-fed1e41e9585', 'Helles Brot', '1', '{"vegetarisch","laktosefrei","nussfrei"}', 'false', null, 'false', '2025-09-04 18:53:18.332582+00', '2025-09-05 08:04:03.518005+00', '5910e53e-e412-4af3-964a-ee76574f8a70'), 
('81d45218-b39d-4dd2-8564-dd9337a03a2e', 'cf42e67c-c00d-4e86-a602-e15db2e5ef86', 'Ajvar-Feta Dip', '1', '{"vegetarisch"}', 'false', null, 'false', '2025-09-04 18:53:18.332582+00', '2025-09-05 08:04:03.518005+00', '5910e53e-e412-4af3-964a-ee76574f8a70'), 
('b58304ce-5759-4408-aac5-03407eae3990', '67016884-af05-4703-b645-49eb1054f3ab', 'Kichererbsen/Melonen Salat', '1', '{"vegetarisch"}', 'false', null, 'false', '2025-09-02 13:21:48.857184+00', '2025-09-05 08:04:03.518005+00', '3a143567-6ff4-4ce2-b828-fb6e875de816'), 
('d5e0da22-1484-4df3-9395-4cefcc06458e', '7fc44706-a623-4e3b-95f6-27d25a4d9652', 'test', '1', '{}', 'false', null, 'false', '2025-09-05 07:58:35.28606+00', '2025-09-05 08:04:03.518005+00', 'f6163208-78e6-4c8d-89f8-2a268237dfdd'), 
('dd58f620-8a07-4208-8911-761191e0db3f', '67016884-af05-4703-b645-49eb1054f3ab', 'Kartoffelsalat (8 Portionen)', '1', '{}', 'false', null, 'false', '2025-09-04 10:02:07.633254+00', '2025-09-05 08:04:03.518005+00', '9d9229f4-77e7-4321-8a4f-e81b4d79697a'), 
('e0567435-92be-4d7c-a9f7-a7154440bda5', '67016884-af05-4703-b645-49eb1054f3ab', 'Reissalat (grosser Salatschüssel)', '1', '{}', 'false', null, 'false', '2025-09-04 13:21:00.371144+00', '2025-09-05 08:04:03.518005+00', 'be9316af-a2a7-4ac8-8105-487c7e732fce'), 
('ea38db00-7292-4f2c-b90b-ece8c7101805', '51bf1709-c64a-4519-a290-2089100e287b', 'delikate Käseplatte', '1', '{}', 'false', null, 'false', '2025-09-04 17:12:55.011169+00', '2025-09-05 08:04:03.518005+00', '25d5d683-2bfd-44cf-a5ed-a6bfce73f0dd');
