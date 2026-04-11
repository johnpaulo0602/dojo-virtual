# Reestruturação de Navegação e UX do Projeto - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reestruturar a navegação do sidebar para ser mais semântica, centralizar as configurações do projeto sob o item "Projeto" e mover as preferências de notificação para a conta do usuário.

**Architecture:** Atualização da configuração central de rotas (`navigation.ts`) e migração de componentes de UI (Notificações) entre as páginas de `Configuracoes` e `Conta`.

**Tech Stack:** React, Tailwind CSS, shadcn/ui, Lucide Icons.

---

### Task 1: Reestruturação da Navegação Central

**Files:**
- Modify: `src/config/navigation.ts`

- [ ] **Step 1: Renomear "Jiu-Jitsu" para "Graduações" e adicionar sub-item "Projeto" em Configurações**

```typescript
// Localize o item "Jiu-Jitsu" e mude o título
{
  title: "Graduações",
  url: "/jiu-jitsu/faixas-graus",
  icon: Award,
  roles: ["admin"],
},

// No grupo "Configurações", adicione o sub-item "Projeto" como o primeiro da lista
{
  title: "Configurações",
  url: "/configuracoes/escolas",
  icon: Settings,
  roles: ["admin"],
  children: [
    { title: "Projeto", url: "/configuracoes", icon: Settings, roles: ["admin"] },
    { title: "Escolas", url: "/configuracoes/escolas", icon: School, roles: ["admin"] },
    // ... outros itens mantidos
  ],
},
```

- [ ] **Step 2: Commit**

```bash
git add src/config/navigation.ts
git commit -m "refactor: rename jiu-jitsu to graduações and add projeto to config menu"
```

---

### Task 2: Refatoração da Página de Projeto

**Files:**
- Modify: `src/pages/Configuracoes.tsx`

- [ ] **Step 1: Atualizar o título da página e remover a seção de Notificações**

```tsx
// 1. Atualizar o título no useEffect
useEffect(() => { setTitle("Configurações do Projeto"); }, [setTitle]);

// 2. Remover os estados de notificação
// Remover: notifyNewStudent, notifyAttendance, notifyFinancial, notifyBeltPromotion e seus respectivos set*

// 3. Remover o bloco de Card das Notificações do JSX
{/* Notifications - REMOVER ESTE BLOCO INTEIRO */}
```

- [ ] **Step 2: Verificar o build para garantir que não restaram referências aos estados removidos**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/pages/Configuracoes.tsx
git commit -m "feat: rename project settings page and remove notifications section"
```

---

### Task 3: Refatoração da Página de Conta (Notificações)

**Files:**
- Modify: `src/pages/Conta.tsx`

- [ ] **Step 1: Adicionar estados e seção de Notificações na página de Conta**

```tsx
// 1. Importar Switch e Bell
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";

// 2. Adicionar os estados na função ContaPage
const [notifyNewStudent, setNotifyNewStudent] = useState(true);
const [notifyAttendance, setNotifyAttendance] = useState(true);
const [notifyFinancial, setNotifyFinancial] = useState(false);
const [notifyBeltPromotion, setNotifyBeltPromotion] = useState(true);

// 3. Inserir o Card de Notificações antes do Role Switcher
<Card>
  <CardHeader>
    <div className="flex items-center gap-2">
      <Bell className="h-5 w-5 text-primary" />
      <CardTitle>Notificações</CardTitle>
    </div>
    <CardDescription>Configure quais notificações deseja receber</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {[
      { label: "Novo aluno cadastrado", desc: "Receber notificação quando um novo aluno for matriculado", value: notifyNewStudent, set: setNotifyNewStudent },
      { label: "Relatório de presença", desc: "Alerta diário de presença das aulas", value: notifyAttendance, set: setNotifyAttendance },
      { label: "Movimentações financeiras", desc: "Alertas de receitas e despesas registradas", value: notifyFinancial, set: setNotifyFinancial },
      { label: "Promoção de faixa", desc: "Notificar quando um aluno for graduado", value: notifyBeltPromotion, set: setNotifyBeltPromotion },
    ].map((item, i) => (
      <div key={i} className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{item.label}</p>
          <p className="text-xs text-muted-foreground">{item.desc}</p>
        </div>
        <Switch checked={item.value} onCheckedChange={item.set} />
      </div>
    ))}
  </CardContent>
</Card>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Conta.tsx
git commit -m "feat: move notifications section to profile page"
```

---

### Task 4: Verificação Final

- [ ] **Step 1: Validar navegação e visibilidade no Sidebar**
- [ ] **Step 2: Verificar comportamento do menu de perfil (footer)**
- [ ] **Step 3: Build final de produção**

Run: `npm run build`
Expected: PASS
