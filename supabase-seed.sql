-- ─────────────────────────────────────────────────
-- Amambaí F.C. — Seed das 48 seleções
-- Execute APÓS o schema no SQL Editor do Supabase
-- ─────────────────────────────────────────────────
-- Blocos do chaveamento:
-- Bloco A: Grupos A, B, C, D (J1, J2, J7, J8 dos 16-avos)
-- Bloco B: Grupos E, F, G, H (J3, J4, J9, J10 dos 16-avos)
-- Bloco C: Grupos I, J, K, L (J5, J6, J11-J16 dos 16-avos)

insert into public.world_cup_teams (name, flag, group_name, tier, draw_block) values

-- GRUPO A — Bloco A
('México',           '🇲🇽', 'A', 'C', 'A'),
('Coreia do Sul',    '🇰🇷', 'A', 'B', 'A'),
('República Tcheca', '🇨🇿', 'A', 'C', 'A'),
('África do Sul',    '🇿🇦', 'A', 'D', 'A'),

-- GRUPO B — Bloco A
('Canadá',           '🇨🇦', 'B', 'B', 'A'),
('Suíça',            '🇨🇭', 'B', 'C', 'A'),
('Bósnia e Herz.',   '🇧🇦', 'B', 'D', 'A'),
('Catar',            '🇶🇦', 'B', 'D', 'A'),

-- GRUPO C — Bloco A (Brasil aqui)
('Brasil',           '🇧🇷', 'C', 'A', 'A'),
('Marrocos',         '🇲🇦', 'C', 'B', 'A'),
('Escócia',          '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'C', 'D', 'A'),
('Haiti',            '🇭🇹', 'C', 'D', 'A'),

-- GRUPO D — Bloco A
('Estados Unidos',   '🇺🇸', 'D', 'B', 'A'),
('Turquia',          '🇹🇷', 'D', 'C', 'A'),
('Austrália',        '🇦🇺', 'D', 'C', 'A'),
('Paraguai',         '🇵🇾', 'D', 'D', 'A'),

-- GRUPO E — Bloco B
('Alemanha',         '🇩🇪', 'E', 'A', 'B'),
('Equador',          '🇪🇨', 'E', 'C', 'B'),
('Costa do Marfim',  '🇨🇮', 'E', 'C', 'B'),
('Curaçao',          '🇨🇼', 'E', 'D', 'B'),

-- GRUPO F — Bloco B
('Holanda',          '🇳🇱', 'F', 'A', 'B'),
('Japão',            '🇯🇵', 'F', 'B', 'B'),
('Suécia',           '🇸🇪', 'F', 'C', 'B'),
('Tunísia',          '🇹🇳', 'F', 'D', 'B'),

-- GRUPO G — Bloco B
('Bélgica',          '🇧🇪', 'G', 'B', 'B'),
('Irã',              '🇮🇷', 'G', 'C', 'B'),
('Egito',            '🇪🇬', 'G', 'D', 'B'),
('Nova Zelândia',    '🇳🇿', 'G', 'D', 'B'),

-- GRUPO H — Bloco B
('Espanha',          '🇪🇸', 'H', 'A', 'B'),
('Uruguai',          '🇺🇾', 'H', 'B', 'B'),
('Arábia Saudita',   '🇸🇦', 'H', 'D', 'B'),
('Cabo Verde',       '🇨🇻', 'H', 'D', 'B'),

-- GRUPO I — Bloco C
('França',           '🇫🇷', 'I', 'A', 'C'),
('Senegal',          '🇸🇳', 'I', 'B', 'C'),
('Noruega',          '🇳🇴', 'I', 'C', 'C'),
('Iraque',           '🇮🇶', 'I', 'D', 'C'),

-- GRUPO J — Bloco C (Argentina aqui)
('Argentina',        '🇦🇷', 'J', 'A', 'C'),
('Áustria',          '🇦🇹', 'J', 'C', 'C'),
('Argélia',          '🇩🇿', 'J', 'D', 'C'),
('Jordânia',         '🇯🇴', 'J', 'D', 'C'),

-- GRUPO K — Bloco C
('Portugal',         '🇵🇹', 'K', 'A', 'C'),
('Colômbia',         '🇨🇴', 'K', 'B', 'C'),
('RD Congo',         '🇨🇩', 'K', 'D', 'C'),
('Uzbequistão',      '🇺🇿', 'K', 'D', 'C'),

-- GRUPO L — Bloco C
('Inglaterra',       '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'L', 'A', 'C'),
('Croácia',          '🇭🇷', 'L', 'B', 'C'),
('Gana',             '🇬🇭', 'L', 'D', 'C'),
('Panamá',           '🇵🇦', 'L', 'D', 'C');
