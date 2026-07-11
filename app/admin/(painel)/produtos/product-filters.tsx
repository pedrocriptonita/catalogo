"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type CategoryOption = { id: string; name: string };

const TODAS = "todas";

export function ProductFilters({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busca, setBusca] = useState(searchParams.get("q") ?? "");

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== TODAS) params.set(key, value);
    else params.delete(key);
    params.delete("pagina"); // filtro novo volta para a página 1
    router.replace(`/admin/produtos?${params.toString()}`);
  }

  // Busca com debounce de 400ms
  useEffect(() => {
    const atual = searchParams.get("q") ?? "";
    if (busca === atual) return;
    const timer = setTimeout(() => setParam("q", busca || null), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  const temFiltro =
    searchParams.get("categoria") ||
    searchParams.get("disponibilidade") ||
    searchParams.get("status") ||
    searchParams.get("q");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Buscar por nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full sm:w-56"
      />

      <Select
        value={searchParams.get("categoria") ?? TODAS}
        onValueChange={(v) => setParam("categoria", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODAS}>Todas categorias</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("disponibilidade") ?? TODAS}
        onValueChange={(v) => setParam("disponibilidade", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Disponibilidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODAS}>Disponibilidade</SelectItem>
          <SelectItem value="DISPONIVEL">Disponível</SelectItem>
          <SelectItem value="ESGOTADO">Esgotado</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("status") ?? TODAS}
        onValueChange={(v) => setParam("status", v)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODAS}>Status</SelectItem>
          <SelectItem value="ativa">Publicada</SelectItem>
          <SelectItem value="inativa">Rascunho</SelectItem>
        </SelectContent>
      </Select>

      {temFiltro && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setBusca("");
            router.replace("/admin/produtos");
          }}
        >
          <X />
          Limpar
        </Button>
      )}
    </div>
  );
}
