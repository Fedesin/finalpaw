--
-- PostgreSQL database dump
--

-- Dumped from database version 14.10 (Ubuntu 14.10-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.10 (Ubuntu 14.10-0ubuntu0.22.04.1)

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
-- Name: roles; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.roles AS ENUM (
    'usuario',
    'supervisor',
    'administrador'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: fase; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fase (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    tipo_producto_id integer NOT NULL,
    atributos json
);


--
-- Name: lote; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lote (
    id integer NOT NULL,
    nro integer NOT NULL,
    fecha date NOT NULL,
    supervisor integer NOT NULL,
    enc_de_prod integer NOT NULL,
    enc_de_limp integer NOT NULL,
    fase integer NOT NULL
);


--
-- Name: producto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.producto (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    tipo_producto_id integer NOT NULL,
    lote_id integer NOT NULL
);


--
-- Name: tipo_producto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipo_producto (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL
);


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(50) NOT NULL,
    rol public.roles NOT NULL,
    created_at timestamp without time zone NOT NULL,
    last_login timestamp without time zone
);


--
-- Data for Name: fase; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fase (id, nombre, tipo_producto_id, atributos) FROM stdin;
\.


--
-- Data for Name: lote; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lote (id, nro, fecha, supervisor, enc_de_prod, enc_de_limp, fase) FROM stdin;
\.


--
-- Data for Name: producto; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.producto (id, nombre, tipo_producto_id, lote_id) FROM stdin;
\.


--
-- Data for Name: tipo_producto; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tipo_producto (id, nombre) FROM stdin;
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuario (id, email, password, rol, created_at, last_login) FROM stdin;
\.


--
-- Name: fase fase_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fase
    ADD CONSTRAINT fase_nombre_key UNIQUE (nombre);


--
-- Name: fase fase_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fase
    ADD CONSTRAINT fase_pkey PRIMARY KEY (id);


--
-- Name: lote lote_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lote
    ADD CONSTRAINT lote_pkey PRIMARY KEY (id);


--
-- Name: producto producto_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_pkey PRIMARY KEY (id);


--
-- Name: tipo_producto tipo_producto_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_producto
    ADD CONSTRAINT tipo_producto_nombre_key UNIQUE (nombre);


--
-- Name: tipo_producto tipo_producto_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_producto
    ADD CONSTRAINT tipo_producto_pkey PRIMARY KEY (id);


--
-- Name: usuario usuario_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_email_key UNIQUE (email);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- Name: lote fk_fase; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lote
    ADD CONSTRAINT fk_fase FOREIGN KEY (fase) REFERENCES public.fase(id) NOT VALID;


--
-- Name: producto fk_lote; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT fk_lote FOREIGN KEY (lote_id) REFERENCES public.lote(id);


--
-- Name: fase fk_tipo_producto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fase
    ADD CONSTRAINT fk_tipo_producto FOREIGN KEY (tipo_producto_id) REFERENCES public.tipo_producto(id);


--
-- Name: producto fk_tipo_producto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT fk_tipo_producto FOREIGN KEY (tipo_producto_id) REFERENCES public.tipo_producto(id);


--
-- Name: lote fk_usuario_enc_de_limp; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lote
    ADD CONSTRAINT fk_usuario_enc_de_limp FOREIGN KEY (enc_de_limp) REFERENCES public.usuario(id);


--
-- Name: lote fk_usuario_enc_de_prod; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lote
    ADD CONSTRAINT fk_usuario_enc_de_prod FOREIGN KEY (enc_de_prod) REFERENCES public.usuario(id);


--
-- Name: lote fk_usuario_supervisor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lote
    ADD CONSTRAINT fk_usuario_supervisor FOREIGN KEY (supervisor) REFERENCES public.usuario(id);


--
-- PostgreSQL database dump complete
--

