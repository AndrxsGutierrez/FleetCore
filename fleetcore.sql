--
-- PostgreSQL database dump
--

\restrict yy1B6nbRPlY25V3qWanmmfLqztXuKeRIcDkqeysEOGJW2lh0iXeqpicOkIbPqfH

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: maintenances_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.maintenances_status_enum AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: maintenances_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.maintenances_type_enum AS ENUM (
    'PREVENTIVE',
    'CORRECTIVE'
);


--
-- Name: mechanics_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.mechanics_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.users_role_enum AS ENUM (
    'ADMIN',
    'TECHNICIAN'
);


--
-- Name: vehicles_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.vehicles_status_enum AS ENUM (
    'AVAILABLE',
    'IN_MAINTENANCE',
    'INACTIVE'
);


--
-- Name: workshops_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.workshops_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    actor_email character varying(160),
    http_method character varying(10) NOT NULL,
    resource character varying(80) NOT NULL,
    resource_id character varying(80),
    path character varying(255) NOT NULL,
    status_code integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    actor_user_id integer
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: maintenances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maintenances (
    id integer NOT NULL,
    type public.maintenances_type_enum NOT NULL,
    description text NOT NULL,
    mileage integer NOT NULL,
    scheduled_date timestamp with time zone NOT NULL,
    scheduled_end_date timestamp with time zone NOT NULL,
    status public.maintenances_status_enum DEFAULT 'SCHEDULED'::public.maintenances_status_enum NOT NULL,
    work_performed text,
    final_cost numeric(12,2),
    completed_at timestamp with time zone,
    final_mileage integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    vehicle_id integer NOT NULL,
    mechanic_id integer NOT NULL,
    workshop_id integer NOT NULL
);


--
-- Name: maintenances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.maintenances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: maintenances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.maintenances_id_seq OWNED BY public.maintenances.id;


--
-- Name: mechanics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mechanics (
    id integer NOT NULL,
    full_name character varying(120) NOT NULL,
    email character varying(160) NOT NULL,
    specialty character varying(100) NOT NULL,
    status public.mechanics_status_enum DEFAULT 'ACTIVE'::public.mechanics_status_enum NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: mechanics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mechanics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mechanics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mechanics_id_seq OWNED BY public.mechanics.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(160) NOT NULL,
    password_hash character varying NOT NULL,
    role public.users_role_enum NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    mechanic_id integer
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicles (
    id integer NOT NULL,
    plate character varying(12) NOT NULL,
    brand character varying(80) NOT NULL,
    model character varying(80) NOT NULL,
    year smallint NOT NULL,
    mileage integer DEFAULT 0 NOT NULL,
    status public.vehicles_status_enum DEFAULT 'AVAILABLE'::public.vehicles_status_enum NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: workshops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workshops (
    id integer NOT NULL,
    name character varying(120) NOT NULL,
    address character varying(250) NOT NULL,
    status public.workshops_status_enum DEFAULT 'ACTIVE'::public.workshops_status_enum NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: workshops_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workshops_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workshops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workshops_id_seq OWNED BY public.workshops.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: maintenances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenances ALTER COLUMN id SET DEFAULT nextval('public.maintenances_id_seq'::regclass);


--
-- Name: mechanics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mechanics ALTER COLUMN id SET DEFAULT nextval('public.mechanics_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Name: workshops id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshops ALTER COLUMN id SET DEFAULT nextval('public.workshops_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, actor_email, http_method, resource, resource_id, path, status_code, created_at, actor_user_id) FROM stdin;
1	admin@fleetcore.test	POST	mechanics	5	/mechanics	201	2026-10-27 16:07:28.666919+00	1
2	admin@fleetcore.test	DELETE	mechanics	5	/mechanics/5	200	2026-10-27 16:07:42.798813+00	1
3	admin@fleetcore.test	POST	vehicles	7	/vehicles	201	2026-10-27 16:08:03.886687+00	1
\.


--
-- Data for Name: maintenances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.maintenances (id, type, description, mileage, scheduled_date, scheduled_end_date, status, work_performed, final_cost, completed_at, final_mileage, created_at, updated_at, vehicle_id, mechanic_id, workshop_id) FROM stdin;
1	PREVENTIVE	Cambio de aceite y revisión general	42000	2026-11-02 12:30:00+00	2026-11-02 14:00:00+00	CANCELLED	\N	\N	\N	\N	2026-10-27 14:17:04.957746+00	2026-10-27 14:38:29.764082+00	1	1	1
2	PREVENTIVE	Cambio de aceite y revisión general	42000	2026-11-02 12:30:00+00	2026-11-02 14:00:00+00	COMPLETED	Se cambió el aceite y el filtro.	450000.00	2026-11-02 14:00:00+00	42050	2026-10-27 14:38:54.007478+00	2026-10-27 14:39:29.749654+00	2	1	1
3	PREVENTIVE	Seed: mantenimiento preventivo completado FLC001	10000	2026-09-27 16:03:54.093+00	2026-09-27 18:03:54.093+00	COMPLETED	Cambio de aceite y revisión general.	350000.00	2026-09-27 18:03:54.093+00	10500	2026-10-27 16:01:20.858817+00	2026-10-27 16:03:53.858773+00	3	3	2
4	CORRECTIVE	Seed: mantenimiento en proceso FLC003	12500	2026-10-27 15:03:54.093+00	2026-10-27 17:03:54.093+00	IN_PROGRESS	\N	\N	\N	\N	2026-10-27 16:01:20.858817+00	2026-10-27 16:03:53.858773+00	5	1	2
\.


--
-- Data for Name: mechanics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mechanics (id, full_name, email, specialty, status, created_at, updated_at) FROM stdin;
2	Laura Gómez	laura.gomez@leetcore.test	Sistemas de frenos	ACTIVE	2026-10-27 15:05:21.209738+00	2026-10-27 15:05:21.209738+00
1	Laura Gómez	laura.gomez@fleetcore.test	Mantenimiento preventivo	ACTIVE	2026-10-27 13:50:18.615658+00	2026-10-27 16:01:20.858817+00
3	Carlos Ruiz	carlos.ruiz@fleetcore.test	Diagnóstico automotriz	ACTIVE	2026-10-27 16:01:20.858817+00	2026-10-27 16:01:20.858817+00
4	Marta Díaz	marta.diaz@fleetcore.test	Sistema eléctrico	INACTIVE	2026-10-27 16:01:20.858817+00	2026-10-27 16:01:20.858817+00
5	Laura Gómez	laura.gomez@fleetcorhe.test	Sistemas de frenos	INACTIVE	2026-10-27 16:07:28.661121+00	2026-10-27 16:07:42.794952+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, role, created_at, updated_at, mechanic_id) FROM stdin;
1	admin@fleetcore.test	$2b$12$pf.Y002qiKFoY9eviomOQe2jJp2KYzbF87ubaqCh2NPdWxwoI36Ia	ADMIN	2026-10-27 16:01:20.858817+00	2026-10-27 16:03:53.858773+00	\N
2	tecnico1@fleetcore.test	$2b$12$pf.Y002qiKFoY9eviomOQe2jJp2KYzbF87ubaqCh2NPdWxwoI36Ia	TECHNICIAN	2026-10-27 16:01:20.858817+00	2026-10-27 16:03:53.858773+00	1
3	tecnico2@fleetcore.test	$2b$12$pf.Y002qiKFoY9eviomOQe2jJp2KYzbF87ubaqCh2NPdWxwoI36Ia	TECHNICIAN	2026-10-27 16:01:20.858817+00	2026-10-27 16:03:53.858773+00	3
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vehicles (id, plate, brand, model, year, mileage, status, created_at, updated_at) FROM stdin;
1	ABC123	Toyota	Hilux	2022	25000	AVAILABLE	2026-10-27 12:48:25.587005+00	2026-10-27 14:38:29.764082+00
2	ABC124	Toyota	Hilux	2022	42050	AVAILABLE	2026-10-27 12:56:36.833414+00	2026-10-27 14:39:29.749654+00
3	FLC001	Toyota	Hilux	2022	10500	AVAILABLE	2026-10-27 16:01:20.858817+00	2026-10-27 16:01:20.858817+00
4	FLC002	Chevrolet	NPR	2021	28000	AVAILABLE	2026-10-27 16:01:20.858817+00	2026-10-27 16:01:20.858817+00
5	FLC003	Ford	Ranger	2023	12500	IN_MAINTENANCE	2026-10-27 16:01:20.858817+00	2026-10-27 16:01:20.858817+00
6	FLC004	Renault	Kangoo	2020	40000	INACTIVE	2026-10-27 16:01:20.858817+00	2026-10-27 16:01:20.858817+00
7	ABC125	Toyota	Hilux	2022	25000	AVAILABLE	2026-10-27 16:08:03.88385+00	2026-10-27 16:08:03.88385+00
\.


--
-- Data for Name: workshops; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workshops (id, name, address, status, created_at, updated_at) FROM stdin;
1	Taller Central	Calle 10 # 20-30, Bogotá	ACTIVE	2026-10-27 14:01:32.923028+00	2026-10-27 14:01:32.923028+00
2	Taller Central FleetCore	Calle 10 # 20-30, Bogotá	ACTIVE	2026-10-27 16:01:20.858817+00	2026-10-27 16:01:20.858817+00
3	Taller Norte FleetCore	Carrera 7 # 150-20, Bogotá	INACTIVE	2026-10-27 16:01:20.858817+00	2026-10-27 16:01:20.858817+00
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 3, true);


--
-- Name: maintenances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.maintenances_id_seq', 4, true);


--
-- Name: mechanics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mechanics_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 7, true);


--
-- Name: workshops_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.workshops_id_seq', 3, true);


--
-- Name: vehicles PK_18d8646b59304dce4af3a9e35b6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY (id);


--
-- Name: audit_logs PK_1bb179d048bbc581caa3b013439; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY (id);


--
-- Name: mechanics PK_2c0ed23afc0cc7ff361c17e53df; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mechanics
    ADD CONSTRAINT "PK_2c0ed23afc0cc7ff361c17e53df" PRIMARY KEY (id);


--
-- Name: maintenances PK_62403473bd524a42d58589aa78b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "PK_62403473bd524a42d58589aa78b" PRIMARY KEY (id);


--
-- Name: workshops PK_6d0e82a124f5b53df91c8989848; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshops
    ADD CONSTRAINT "PK_6d0e82a124f5b53df91c8989848" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: users REL_2ad56818bbfaa47fb6bca92d30; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "REL_2ad56818bbfaa47fb6bca92d30" UNIQUE (mechanic_id);


--
-- Name: mechanics UQ_301c3b5fa2d49aab65dcfda36a6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mechanics
    ADD CONSTRAINT "UQ_301c3b5fa2d49aab65dcfda36a6" UNIQUE (email);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: vehicles UQ_ec7181ebdab798d97070122a5bf; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT "UQ_ec7181ebdab798d97070122a5bf" UNIQUE (plate);


--
-- Name: users FK_2ad56818bbfaa47fb6bca92d30e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_2ad56818bbfaa47fb6bca92d30e" FOREIGN KEY (mechanic_id) REFERENCES public.mechanics(id) ON DELETE SET NULL;


--
-- Name: maintenances FK_a47e3420d123ccf06ab72e1969c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "FK_a47e3420d123ccf06ab72e1969c" FOREIGN KEY (workshop_id) REFERENCES public.workshops(id) ON DELETE RESTRICT;


--
-- Name: maintenances FK_d501088741618ca66074d85e411; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "FK_d501088741618ca66074d85e411" FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE RESTRICT;


--
-- Name: audit_logs FK_f160d97a931844109de9d04228f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "FK_f160d97a931844109de9d04228f" FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: maintenances FK_f92519be34af2de954da0bd4a47; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "FK_f92519be34af2de954da0bd4a47" FOREIGN KEY (mechanic_id) REFERENCES public.mechanics(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict yy1B6nbRPlY25V3qWanmmfLqztXuKeRIcDkqeysEOGJW2lh0iXeqpicOkIbPqfH
