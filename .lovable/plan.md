

# Database Schema e API REST — Projeto Jiu-Jitsu Social

## Database Schema (PostgreSQL / Supabase)

```text
┌─────────────────────────────────────────────────────────────────────┐
│  auth.users (Supabase Auth — gerenciado automaticamente)           │
│  id, email, encrypted_password, ...                                │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ 1:1
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│  profiles                                                           │
│  id (uuid PK → auth.users.id)                                      │
│  name text NOT NULL                                                 │
│  email text NOT NULL                                                │
│  phone text                                                         │
│  avatar_url text                                                    │
│  created_at timestamptz DEFAULT now()                               │
│  updated_at timestamptz DEFAULT now()                               │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ 1:N
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│  user_roles                                                         │
│  id uuid PK DEFAULT gen_random_uuid()                               │
│  user_id uuid FK → auth.users(id) ON DELETE CASCADE                 │
│  role app_role NOT NULL  (enum: admin, instrutor, monitor, responsavel) │
│  UNIQUE(user_id, role)                                              │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  schools                                                            │
│  id uuid PK                                                         │
│  name text NOT NULL                                                 │
│  address text                                                       │
│  phone text                                                         │
│  created_at / updated_at                                            │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ 1:N
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│  students                                                           │
│  id uuid PK                                                         │
│  matricula text UNIQUE NOT NULL                                     │
│  name text NOT NULL                                                 │
│  cpf text UNIQUE NOT NULL                                           │
│  rg text                                                            │
│  birth_date date NOT NULL                                           │
│  gender text CHECK (gender IN ('masculino','feminino','outro'))     │
│  email text                                                         │
│  phone text                                                         │
│  avatar_url text                                                    │
│  -- Endereço                                                        │
│  cep text, street text, address_number text, complement text        │
│  neighborhood text, city text, state text                           │
│  -- Escola                                                          │
│  school_id uuid FK → schools(id)                                    │
│  school_level text, school_year text, school_shift text             │
│  -- Jiu-Jitsu                                                       │
│  belt_name text NOT NULL DEFAULT 'white_belt'                       │
│  belt_degree int NOT NULL DEFAULT 0                                 │
│  start_date date NOT NULL                                           │
│  class_id uuid FK → class_groups(id)                                │
│  status text CHECK (status IN ('ativo','inativo','pendente'))       │
│  -- Contribuição                                                    │
│  is_contribution_exempt boolean DEFAULT false                       │
│  custom_contribution_amount numeric(10,2)  -- NULL = usa padrão    │
│  -- Saúde                                                           │
│  allergies text, medications text, conditions text                  │
│  blood_type text, emergency_contact text, emergency_phone text      │
│  health_observations text                                           │
│  created_at / updated_at                                            │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  guardians                                                          │
│  id uuid PK                                                         │
│  student_id uuid FK → students(id) ON DELETE CASCADE                │
│  name text NOT NULL                                                 │
│  cpf text NOT NULL                                                  │
│  relationship text CHECK (IN ('mae','pai','outro'))                 │
│  phone text NOT NULL                                                │
│  email text                                                         │
│  profession text                                                    │
│  is_primary boolean DEFAULT false                                   │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  class_groups                                                       │
│  id uuid PK                                                         │
│  name text NOT NULL                                                 │
│  description text                                                   │
│  instructor_id uuid FK → team_members(id)                           │
│  location text                                                      │
│  capacity int NOT NULL                                              │
│  status text CHECK (IN ('ativa','inativa'))                         │
│  age_range text                                                     │
│  belt_range text                                                    │
│  created_at / updated_at                                            │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  class_schedules                                                    │
│  id uuid PK                                                         │
│  class_group_id uuid FK → class_groups(id) ON DELETE CASCADE        │
│  day_of_week int NOT NULL (0-6)                                     │
│  start_time time NOT NULL                                           │
│  end_time time NOT NULL                                             │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  class_enrollments  (alunos matriculados em turmas)                 │
│  id uuid PK                                                         │
│  class_group_id uuid FK → class_groups(id)                          │
│  student_id uuid FK → students(id)                                  │
│  enrolled_at timestamptz DEFAULT now()                               │
│  UNIQUE(class_group_id, student_id)                                 │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  lessons                                                            │
│  id uuid PK                                                         │
│  class_group_id uuid FK → class_groups(id)                          │
│  date date NOT NULL                                                 │
│  start_time time, end_time time                                     │
│  location text                                                      │
│  instructor_id uuid FK → team_members(id)                           │
│  status text CHECK (IN ('agendada','realizada','cancelada'))        │
│  topic text                                                         │
│  created_at / updated_at                                            │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  attendance_records                                                  │
│  id uuid PK                                                         │
│  lesson_id uuid FK → lessons(id) ON DELETE CASCADE                  │
│  student_id uuid FK → students(id)                                  │
│  present boolean NOT NULL DEFAULT false                              │
│  checked_in_at timestamptz                                          │
│  UNIQUE(lesson_id, student_id)                                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  team_members                                                       │
│  id uuid PK                                                         │
│  user_id uuid FK → auth.users(id) (nullable, se vinculado)          │
│  name text NOT NULL                                                 │
│  email text, phone text                                             │
│  role text CHECK (IN ('instrutor','monitor'))                       │
│  belt_name text NOT NULL                                            │
│  belt_degree int NOT NULL DEFAULT 0                                 │
│  specialties text[]                                                 │
│  start_date date                                                    │
│  status text CHECK (IN ('ativo','inativo'))                         │
│  avatar_url text                                                    │
│  created_at / updated_at                                            │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  team_member_classes  (N:N equipe ↔ turmas)                         │
│  team_member_id uuid FK → team_members(id)                          │
│  class_group_id uuid FK → class_groups(id)                          │
│  PK(team_member_id, class_group_id)                                 │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  transactions                                                       │
│  id uuid PK                                                         │
│  type text CHECK (IN ('receita','despesa')) NOT NULL                │
│  category text NOT NULL                                             │
│  description text NOT NULL                                          │
│  amount numeric(10,2) NOT NULL                                      │
│  date date NOT NULL                                                 │
│  status text CHECK (IN ('pago','pendente','cancelado'))             │
│  paid_by text                                                       │
│  recurrence text DEFAULT 'unico'                                   │
│  installments int                                                   │
│  current_installment int                                            │
│  student_id uuid FK → students(id)  -- se for contribuição         │
│  created_at / updated_at                                            │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  donors                                                             │
│  id uuid PK                                                         │
│  name text NOT NULL                                                 │
│  email text, phone text, whatsapp text                              │
│  entity_type text CHECK (IN ('pessoa_fisica','pessoa_juridica'))    │
│  document text  -- CPF ou CNPJ                                      │
│  address text                                                       │
│  notes text                                                         │
│  created_at / updated_at                                            │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  donations                                                          │
│  id uuid PK                                                         │
│  donor_id uuid FK → donors(id) ON DELETE CASCADE                    │
│  amount numeric(10,2) NOT NULL                                      │
│  date date NOT NULL                                                 │
│  method text CHECK (IN ('pix','transferencia','dinheiro','cartao')) │
│  description text                                                   │
│  created_at timestamptz DEFAULT now()                               │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  student_contributions  (pagamentos mensais dos alunos)             │
│  id uuid PK                                                         │
│  student_id uuid FK → students(id) ON DELETE CASCADE                │
│  reference text NOT NULL  (ex: "Mar/2026")                          │
│  amount numeric(10,2) NOT NULL                                      │
│  date date NOT NULL                                                 │
│  method text CHECK (IN ('pix','transferencia','dinheiro','cartao')) │
│  status text CHECK (IN ('pago','pendente'))                         │
│  receipt_url text                                                   │
│  transaction_id uuid FK → transactions(id)  -- link financeiro     │
│  created_at timestamptz DEFAULT now()                               │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  graduations  (histórico de graduações)                              │
│  id uuid PK                                                         │
│  student_id uuid FK → students(id) ON DELETE CASCADE                │
│  belt_name text NOT NULL                                            │
│  belt_degree int NOT NULL                                           │
│  date date NOT NULL                                                 │
│  notes text                                                         │
│  created_at timestamptz DEFAULT now()                               │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  feedbacks  (feedbacks de evolução)                                  │
│  id uuid PK                                                         │
│  student_id uuid FK → students(id) ON DELETE CASCADE                │
│  title text NOT NULL                                                │
│  description text                                                   │
│  date date NOT NULL                                                 │
│  author_id uuid FK → auth.users(id)                                 │
│  created_at timestamptz DEFAULT now()                               │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  student_documents                                                   │
│  id uuid PK                                                         │
│  student_id uuid FK → students(id) ON DELETE CASCADE                │
│  doc_type text NOT NULL (cpf, rg, residencia, matricula, etc.)      │
│  file_url text NOT NULL                                             │
│  uploaded_at timestamptz DEFAULT now()                               │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  notifications                                                       │
│  id uuid PK                                                         │
│  user_id uuid FK → auth.users(id) ON DELETE CASCADE                 │
│  type text CHECK (IN ('info','warning','success'))                  │
│  title text NOT NULL                                                │
│  description text                                                   │
│  is_read boolean DEFAULT false                                      │
│  created_at timestamptz DEFAULT now()                               │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  system_settings  (chave-valor para configs globais)                 │
│  key text PK                                                         │
│  value text NOT NULL                                                │
│  updated_at timestamptz DEFAULT now()                               │
│  -- ex: key='default_contribution_amount', value='50'               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## API REST — Endpoints, Responses e Páginas Consumidoras

### 1. Auth

| Método | Endpoint | Descrição | Página |
|--------|----------|-----------|--------|
| POST | `/auth/signup` | Criar conta | Login |
| POST | `/auth/login` | Login | Login |
| POST | `/auth/logout` | Logout | Header (todas) |
| GET | `/auth/me` | Usuário atual + role | Todas (AuthContext) |

```json
// GET /auth/me → 200
{
  "id": "uuid",
  "name": "Carlos Silva",
  "email": "admin@projeto.org",
  "role": "admin",
  "avatar_url": null
}
```

---

### 2. Students (`/api/students`)

| Método | Endpoint | Descrição | Página |
|--------|----------|-----------|--------|
| GET | `/api/students` | Listar (com filtros: status, belt, class, search) | Alunos, MeusAlunos, Dashboard |
| GET | `/api/students/:id` | Detalhe completo (com guardians, health) | PerfilAluno |
| POST | `/api/students` | Cadastrar aluno | NovoAluno |
| PUT | `/api/students/:id` | Atualizar dados | PerfilAluno |
| PATCH | `/api/students/:id/status` | Ativar/inativar | PerfilAluno, Alunos |
| PATCH | `/api/students/:id/contribution` | Atualizar isenção/valor | PerfilAluno (aba Contribuição) |

```json
// GET /api/students → 200
{
  "data": [
    {
      "id": "uuid", "matricula": "MAT-2025-001", "name": "Lucas Ferreira",
      "cpf": "123.456.789-00", "birth_date": "2012-03-15",
      "belt_name": "white_belt", "belt_degree": 0,
      "school_name": "E.M. Santos Dumont", "class_name": "Kids Iniciante",
      "start_date": "2025-01-10", "status": "ativo"
    }
  ],
  "total": 127, "page": 1, "per_page": 20
}
```

```json
// GET /api/students/:id → 200
{
  "id": "uuid", "name": "Lucas Ferreira", "cpf": "123.456.789-00",
  "gender": "masculino", "birth_date": "2012-03-15",
  "address": { "cep": "01001-000", "street": "Rua das Flores", "number": "45", "neighborhood": "Centro", "city": "São Paulo", "state": "SP" },
  "belt_name": "white_belt", "belt_degree": 0,
  "school": { "id": "uuid", "name": "E.M. Santos Dumont" },
  "class_group": { "id": "uuid", "name": "Kids Iniciante" },
  "guardians": [
    { "id": "uuid", "name": "Maria Ferreira", "relationship": "mae", "phone": "(11) 98888-1111", "is_primary": true }
  ],
  "health": { "allergies": null, "blood_type": "O+", "emergency_contact": "Maria", "emergency_phone": "(11) 98888-1111" },
  "is_contribution_exempt": false,
  "custom_contribution_amount": null,
  "status": "ativo"
}
```

---

### 3. Guardians (`/api/students/:id/guardians`)

| Método | Endpoint | Descrição | Página |
|--------|----------|-----------|--------|
| GET | `/api/students/:id/guardians` | Listar responsáveis | PerfilAluno (aba Responsáveis) |
| POST | `/api/students/:id/guardians` | Adicionar responsável | PerfilAluno |
| PUT | `/api/students/:id/guardians/:gid` | Editar | PerfilAluno |
| DELETE | `/api/students/:id/guardians/:gid` | Remover | PerfilAluno |

---

### 4. Contributions (`/api/students/:id/contributions`)

| Método | Endpoint | Descrição | Página |
|--------|----------|-----------|--------|
| GET | `/api/students/:id/contributions` | Histórico de pagamentos | PerfilAluno (aba Contribuição) |
| POST | `/api/students/:id/contributions` | Registrar pagamento (+ cria transaction) | PerfilAluno (aba Contribuição) |

```json
// GET /api/students/:id/contributions → 200
{
  "data": [
    { "id": "uuid", "reference": "Mar/2026", "amount": 50.00, "date": "2026-03-05", "method": "pix", "status": "pago", "receipt_url": null }
  ]
}
```

```json
// POST /api/students/:id/contributions  body:
{ "reference": "Abr/2026", "amount": 50.00, "date": "2026-04-05", "method": "pix", "receipt": "(file)" }
// → 201 { "id": "uuid", ... }
```

---

### 5. Graduations (`/api/students/:id/graduations`)

| Método | Endpoint | Descrição | Página |
|--------|----------|-----------|--------|
| GET | `/api/students/:id/graduations` | Histórico | PerfilAluno (aba Evolução) |
| POST | `/api/students/:id/graduations` | Registrar graduação (atualiza belt no student) | PerfilAluno |

```json
// POST body: { "belt_name": "blue_belt", "belt_degree": 0, "date": "2026-03-10" }
// → 201
```

---

### 6. Feedbacks (`/api/students/:id/feedbacks`)

| Método | Endpoint | Descrição | Página |
|--------|----------|-----------|--------|
| GET | `/api/students/:id/feedbacks` | Listar | PerfilAluno (aba Evolução) |
| POST | `/api/students/:id/feedbacks` | Criar feedback | PerfilAluno |

---

### 7. Documents (`/api/students/:id/documents`)

| Método | Endpoint | Descrição | Página |
|--------|----------|-----------|--------|
| GET | `/api/students/:id/documents` | Listar documentos | PerfilAluno (aba Documentos) |
| POST | `/api/students/:id/documents` | Upload | PerfilAluno |
| DELETE | `/api/students/:id/documents/:did` | Remover | PerfilAluno |

---

### 8. Class Groups (`/api/class-groups`)

| Método | Endpoint | Descrição | Página |
|--------|----------|-----------|--------|
| GET | `/api/class-groups` | Listar turmas | Turmas, Dashboard, NovoAluno, ConfigTurmas |
| GET | `/api/class-groups/:id` | Detalhe (com schedules e enrolled) | TurmaDetalhe |
| POST | `/api/class-groups` | Criar turma | ConfigTurmas |
| PUT | `/api/class-groups/:id` | Editar | ConfigTurmas |
| DELETE | `/api/class-groups/:id` | Remover | ConfigTurmas |

```json
// GET /api/class-groups → 200
{
  "data": [
    {
      "id": "uuid", "name": "Kids Iniciante", "instructor_name": "Prof. Ricardo Silva",
      "schedule": [{ "day_of_week": 2, "start_time": "14:00", "end_time": "15:00" }],
      "location": "Quadra Principal", "capacity": 25, "enrolled_count": 18,
      "status": "ativa", "age_range": "6-9 anos", "belt_range": "Branca"
    }
  ]
}
```

---

### 9. Lessons (`/api/lessons`)

| Método | Endpoint | Descrição | Página |
|--------|----------|-----------|--------|
| GET | `/api/lessons?class_id=&month=` | Listar aulas | Aulas, Dashboard |
| GET | `/api/lessons/:id` | Detalhe da aula | AulaDetalhe |
| POST | `/api/lessons` | Criar aula avulsa | ConfigAulas |
| PATCH | `/api/lessons/:id` | Atualizar status/tópico | AulaDetalhe |

---

### 10. Attendance (`/api/lessons/:id/attendance`)

| Método | Endpoint | Descrição | Página |
|--------|----------|-----------|--------|
| GET | `/api/lessons/:id/attendance` | Lista presença | AulaDetalhe, Presencas |
| PUT | `/api/lessons/:id/attendance` | Salvar chamada (batch) | AulaDetalhe |

```json
// GET → 200
{
  "data": [
    { "student_id": "uuid", "student_name": "Lucas Ferreira", "belt_name": "white_belt", "belt_degree": 0, "present": true, "checked_in_at": "14:02" }
  ]
}
```

---

### 11. Team Members (`/api/team-members`)

| Método | Endpoint | Descrição | Página |
|--------|----------|-----------|--------|
| GET | `/api/team-members` | Listar equipe | EquipeTecnica, ConfigEquipe, Dashboard |
| POST | `/api/team-members` | Adicionar membro | ConfigEquipe |
| PUT | `/api/team-members/:id` | Editar | ConfigEquipe |
| PATCH | `/api/team-members/:id/status` | Ativar/desativar | ConfigEquipe |

```json
// GET → 200
{
  "data": [
    { "id": "uuid", "name": "Rafael Silva", "role": "instrutor", "belt_name": "black_belt", "belt_degree": 2, "specialties": ["Kids","Juvenil"], "classes": ["Kids Iniciante"], "status": "ativo" }
  ]
}
```

---

### 12. Schools (`/api/schools`)

| Método | Endpoint | Descrição | Página |
|--------|----------|-----------|--------|
| GET | `/api/schools` | Listar | Escolas, NovoAluno, ConfigEscolas |
| POST | `/api/schools` | Criar | ConfigEscolas |
| PUT | `/api/schools/:id` | Editar | ConfigEscolas |
| DELETE | `/api/schools/:id` | Remover | ConfigEscolas |

---

### 13. Transactions (`/api/transactions`)

| Método | Endpoint | Descrição | Página |
|--------|----------|-----------|--------|
| GET | `/api/transactions?type=&category=&status=&from=&to=` | Listar | Financeiro, Receitas, Despesas, Relatorios |
| POST | `/api/transactions` | Criar lançamento | Financeiro (dialog) |
| PUT | `/api/transactions/:id` | Editar | Financeiro |
| DELETE | `/api/transactions/:id` | Excluir | Financeiro |
| GET | `/api/transactions/summary?period=` | Resumo (totais, gráfico) | Dashboard, Relatorios |

```json
// GET /api/transactions/summary → 200
{
  "total_receitas": 21900, "total_despesas": 14550, "saldo": 7350,
  "monthly": [
    { "month": "Jan/26", "receitas": 9500, "despesas": 6500 },
    { "month": "Fev/26", "receitas": 6300, "despesas": 4750 }
  ]
}
```

---

### 14. Donors & Donations (`/api/donors`)

| Método | Endpoint | Descrição | Página |
|--------|----------|-----------|--------|
| GET | `/api/donors` | Listar doadores | Doadores |
| GET | `/api/donors/:id` | Detalhe + doações | DoadorDetalhe |
| POST | `/api/donors` | Cadastrar doador | Doacoes (dialog) |
| PUT | `/api/donors/:id` | Editar | DoadorDetalhe |
| POST | `/api/donors/:id/donations` | Registrar doação | Doacoes (dialog) |

---

### 15. Notifications (`/api/notifications`)

| Método | Endpoint | Descrição | Página |
|--------|----------|-----------|--------|
| GET | `/api/notifications` | Listar do usuário | Header (NotificationsDropdown) |
| PATCH | `/api/notifications/:id/read` | Marcar como lida | Header |
| PATCH | `/api/notifications/read-all` | Marcar todas como lidas | Header |
| DELETE | `/api/notifications/:id` | Excluir | Header |
| DELETE | `/api/notifications` | Limpar todas | Header |

```json
// GET → 200
{
  "data": [
    { "id": "uuid", "type": "info", "title": "Novo aluno", "description": "Mariana Alves foi cadastrada", "is_read": false, "created_at": "2026-03-11T10:00:00Z" }
  ],
  "unread_count": 3
}
```

---

### 16. System Settings (`/api/settings`)

| Método | Endpoint | Descrição | Página |
|--------|----------|-----------|--------|
| GET | `/api/settings` | Todas as configurações | Configuracoes |
| PUT | `/api/settings/:key` | Atualizar valor | Configuracoes |

```json
// GET → 200
{
  "default_contribution_amount": "50",
  "project_name": "Projeto Tatame Cidadão"
}
```

---

### Resumo de Páginas × Endpoints

| Página | Endpoints consumidos |
|--------|---------------------|
| **Dashboard** | `/auth/me`, `/students` (count), `/team-members` (count), `/transactions/summary`, `/lessons` |
| **Alunos** | `/students` |
| **NovoAluno** | `/students` (POST), `/schools`, `/class-groups` |
| **PerfilAluno** | `/students/:id`, `/guardians`, `/contributions`, `/graduations`, `/feedbacks`, `/documents` |
| **Turmas** | `/class-groups` |
| **TurmaDetalhe** | `/class-groups/:id`, `/students?class_id=` |
| **Aulas** | `/lessons` |
| **AulaDetalhe** | `/lessons/:id`, `/lessons/:id/attendance` |
| **Presencas** | `/lessons/:id/attendance` |
| **EquipeTecnica** | `/team-members` |
| **Escolas** | `/schools` |
| **Financeiro/Receitas/Despesas** | `/transactions` |
| **Relatorios** | `/transactions/summary` |
| **Doadores/DoadorDetalhe** | `/donors`, `/donors/:id/donations` |
| **Doacoes** | `/donors`, `/donors/:id/donations` (POST) |
| **Configuracoes** | `/settings` |
| **Header (todas)** | `/auth/me`, `/notifications` |

