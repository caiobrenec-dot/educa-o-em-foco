import React, { useState } from "react";
import { usePonto } from "../../hooks/use-ponto";
import { X, Building2, MapPin, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface NewStoreModalProps {
  onClose: () => void;
}

export function NewStoreModal({ onClose }: NewStoreModalProps) {
  const { addStore } = usePonto();

  const [name, setName] = useState("");
  const [city, setCity] = useState("Londrina");
  const [state, setState] = useState("PR");
  const [address, setAddress] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [managerName, setManagerName] = useState("");
  const [openingHours, setOpeningHours] = useState("Seg a Sáb: 10:00 às 22:00 | Dom: 14:00 às 20:00");
  const [allowedRadiusMeters, setAllowedRadiusMeters] = useState(250);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      toast.error("Preencha o nome da loja e endereço.");
      return;
    }

    addStore({
      name: name.trim().startsWith("Athleta") ? name.trim() : `Athleta ${name.trim()}`,
      code: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      city: city.trim(),
      state: state.trim(),
      address: address.trim(),
      cnpj: cnpj.trim() || "12.345.678/0004-33",
      phone: phone.trim() || "(43) 3300-0000",
      managerName: managerName.trim() || "Gerente Responsável",
      gpsCoords: {
        lat: -23.3105,
        lng: -51.1628,
        allowedRadiusMeters,
      },
      openingHours,
      activeEmployeesCount: 0,
    });

    toast.success(`Unidade ${name} cadastrada com sucesso!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#005C30] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFC72C] text-[#004724] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cadastrar Nova Loja Athleta</h3>
              <p className="text-xs text-white/80">Expansão da rede de lojas físicas e quiosques</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
              Nome da Unidade *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Athleta Shopping Maringá Park"
              className="w-full p-2.5 bg-slate-50 border rounded-xl font-semibold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Cidade
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                UF
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-xl uppercase font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
              Endereço Completo & Loja *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Av. São Paulo, 120 - Loja 45, Zona 01"
              className="w-full p-2.5 bg-slate-50 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                CNPJ da Filial
              </label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="12.345.678/0004-33"
                className="w-full p-2 bg-slate-50 border rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Telefone da Loja
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(43) 3300-0000"
                className="w-full p-2 bg-slate-50 border rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Gerente Responsável
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="Nome do gerente"
                className="w-full p-2 bg-slate-50 border rounded-xl"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Raio GPS Permitido (Metros)
              </label>
              <input
                type="number"
                value={allowedRadiusMeters}
                onChange={(e) => setAllowedRadiusMeters(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#005C30] hover:bg-[#004724] text-white font-bold transition-all shadow-md"
            >
              Cadastrar Loja
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
