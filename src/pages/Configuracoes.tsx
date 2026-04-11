import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Settings, Bell, Shield, Instagram, Facebook, Twitter, Plus, Trash2, Users } from "lucide-react";

export default function ConfiguracoesPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Configurações do Projeto"); }, [setTitle]);

  const [projectName, setProjectName] = useState("Dojo Virtual");
  const [projectEmail, setProjectEmail] = useState("contato@dojovirtual.org");
  const [projectPhone, setProjectPhone] = useState("(11) 3000-0000");
  const [projectAddress, setProjectAddress] = useState("Rua do Esporte, 100 - Centro, São Paulo - SP");
  const [projectDescription, setProjectDescription] = useState("Dojo Virtual - Sistema de gestão de Jiu-Jitsu voltado para a modernização e organização da arte suave.");
  const [cnpj, setCnpj] = useState("12.345.678/0001-90");

  const [socials, setSocials] = useState([
    { platform: "instagram", url: "@projetojjsocial" },
    { platform: "facebook", url: "facebook.com/projetojjsocial" },
  ]);
  const addSocial = () => setSocials((prev) => [...prev, { platform: "", url: "" }]);
  const removeSocial = (i: number) => setSocials((prev) => prev.filter((_, idx) => idx !== i));
  const updateSocial = (i: number, field: "platform" | "url", value: string) =>
    setSocials((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const [managers, setManagers] = useState([
    { name: "Carlos Silva", phone: "(11) 99999-0001", email: "carlos@projeto.org" },
  ]);
  const addManager = () => setManagers((prev) => [...prev, { name: "", phone: "", email: "" }]);
  const removeManager = (i: number) => setManagers((prev) => prev.filter((_, idx) => idx !== i));
  const updateManager = (i: number, field: "name" | "phone" | "email", value: string) =>
    setManagers((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));

  const [defaultBelt, setDefaultBelt] = useState("white_belt");
  const [maxStudentsPerClass, setMaxStudentsPerClass] = useState("25");
  const [attendanceThreshold, setAttendanceThreshold] = useState("75");
  const [defaultContribution, setDefaultContribution] = useState("50");

  const handleSave = () => {
    toast({ title: "Configurações salvas", description: "As alterações foram aplicadas com sucesso." });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Project Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>Informações do Projeto</CardTitle>
          </div>
          <CardDescription>Dados gerais do projeto social</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto</Label>
              <Input id="name" value={projectName} onChange={e => setProjectName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={projectEmail} onChange={e => setProjectEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={projectPhone} onChange={e => setProjectPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" value={projectAddress} onChange={e => setProjectAddress(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Descrição</Label>
            <Textarea id="desc" rows={3} value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} />
          </div>

          <Separator />

          {/* Social media */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Redes Sociais</Label>
              <Button variant="outline" size="sm" onClick={addSocial}><Plus className="mr-2 h-4 w-4" /> Adicionar</Button>
            </div>
            {socials.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select value={s.platform} onValueChange={(v) => updateSocial(i, "platform", v)}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Rede" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="x">X (Twitter)</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
                <Input className="flex-1" value={s.url} onChange={(e) => updateSocial(i, "url", e.target.value)} placeholder="@usuario ou link" />
                <Button variant="ghost" size="icon" onClick={() => removeSocial(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            {socials.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma rede social adicionada.</p>}
          </div>

          <Separator />

          {/* Manager contacts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Label className="text-base font-medium">Contatos dos Gestores</Label>
              </div>
              <Button variant="outline" size="sm" onClick={addManager}><Plus className="mr-2 h-4 w-4" /> Adicionar</Button>
            </div>
            {managers.map((m, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Gestor {i + 1}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeManager(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input value={m.name} onChange={(e) => updateManager(i, "name", e.target.value)} placeholder="Nome" />
                  <Input value={m.phone} onChange={(e) => updateManager(i, "phone", e.target.value)} placeholder="Telefone" />
                  <Input value={m.email} onChange={(e) => updateManager(i, "email", e.target.value)} placeholder="Email" />
                </div>
              </div>
            ))}
            {managers.length === 0 && <p className="text-sm text-muted-foreground">Nenhum gestor adicionado.</p>}
          </div>
        </CardContent>
      </Card>

      {/* System Defaults */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Padrões do Sistema</CardTitle>
          </div>
          <CardDescription>Configurações padrão para novos cadastros</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Faixa inicial padrão</Label>
              <Select value={defaultBelt} onValueChange={setDefaultBelt}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="white_belt">Branca</SelectItem>
                  <SelectItem value="grey_white_belt">Cinza e Branca</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Máx. alunos por turma</Label>
              <Input type="number" value={maxStudentsPerClass} onChange={e => setMaxStudentsPerClass(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Frequência mínima (%)</Label>
              <Input type="number" value={attendanceThreshold} onChange={e => setAttendanceThreshold(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Contribuição mensal padrão (R$)</Label>
              <Input type="number" value={defaultContribution} onChange={e => setDefaultContribution(e.target.value)} />
              <p className="text-xs text-muted-foreground">Valor padrão cobrado dos alunos como taxa de manutenção</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Salvar Configurações</Button>
      </div>
    </div>
  );
}
