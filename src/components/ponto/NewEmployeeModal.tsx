import React, { useState } from "react";
import { Employee, RoleType, Store } from "../../lib/ponto-store";
import { usePonto } from "../../hooks/use-ponto";
import { X, UserPlus, Building2, ShieldCheck, Mail, Phone, User, Clock } from "lucide-react";
import { toast } from "sonner";

interface NewEmployeeModalProps {
  onClose: () => void;
}

export function NewEmployeeModal({ onClose }: NewEmployeeModalProps) {
  const { stores, schedules, addEmployee } = usePonto();

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [matricula, setMatricula] = useState(`ATH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<RoleType>("Vendedor(a) Esportivo");
  const [storeId, setStoreId] = useState<string>(stores[0]?.id || "store-catuai");
  const [defaultScheduleId, setDefaultScheduleId] = useState<string>(schedules[0]?.id || "sch-shopping-abertura");
  const [contractHoursPerWeek, setContractHoursPerWeek] = useState(44);
  const [pin, setPin] = useState("1234");
  const [hourlyRate, setHourlyRate] = useState(18.0);
  const [avatar, setAvatar] = useState(
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cpf.trim()) {
      toast.error("Nome e CPF são obrigatórios.");
      return;
    }

    addEmployee({
      name: name.trim(),
      cpf: cpf.trim(),
      matricula: matricula.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, ".")}@athleta.com.br`,
      phone: phone.trim() || "(43) 99000-0000",
      role,
      storeId,
      admissionDate: new Date().toISOString().split("T")[0],
      contractHoursPerWeek,
      status: "ativo",
      pin: pin.trim() || "1234",
      defaultScheduleId,
      avatar,
      hourlyRate,
    });

    toast.success(`Funcionário ${name} cadastrado com sucesso!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#005C30] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFC72C] text-[#004724] flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Cadastrar Novo Colaborador</h3>
              <p className="text-xs text-white/80">Integração imediata com o Totem Quiosque e Escalas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Gabriel Souza Santos"
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                CPF *
              </label>
              <input
                type="text"
                required
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Cargo / Função
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RoleType)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
              >
                <option value="Gerente Geral">Gerente Geral</option>
                <option value="Gerente de Loja">Gerente de Loja</option>
                <option value="Subgerente">Subgerente</option>
                <option value="Vendedor(a) Líder">Vendedor(a) Líder</option>
                <option value="Vendedor(a) Esportivo">Vendedor(a) Esportivo</option>
                <option value="Consultor(a) de Vendas">Consultor(a) de Vendas</option>
                <option value="Operador(a) de Caixa">Operador(a) de Caixa</option>
                <option value="Estoquista">Estoquista</option>
                <option value="Auxiliar de Loja">Auxiliar de Loja</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Unidade / Loja Vinculada
              </label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                PIN de Acesso ao Totem Quiosque (4 Dígitos) *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-mono font-bold tracking-widest text-[#005C30]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Matrícula Interna
              </label>
              <input
                type="text"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                E-mail Corporativo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@athleta.com.br"
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(43) 99999-9999"
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Escala Padrão Inicial
              </label>
              <select
                value={defaultScheduleId}
                onChange={(e) => setDefaultScheduleId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
              >
                {schedules.map((sch) => (
                  <option key={sch.id} value={sch.id}>
                    {sch.name} — {sch.entryTime} às {sch.exitTime} (Carga: {sch.weeklyHours}h)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#005C30] hover:bg-[#004724] text-white font-bold transition-all shadow-md"
            >
              Salvar Colaborador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
