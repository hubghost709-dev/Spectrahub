"use client";

import React, { useState, useEffect, useRef } from "react";
import qs from "query-string";
import { SearchIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {};

function Search({}: Props) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detectar si estamos en un dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Enfocar el input cuando se expande en móvil
  useEffect(() => {
    if (isExpanded && isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded, isMobile]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value) return;

    const url = qs.stringifyUrl(
      {
        url: "/search",
        query: { term: value },
      },
      { skipEmptyString: true }
    );
    
    router.push(url);
    if (isMobile) setIsExpanded(false);
  };

  const onClear = () => setValue("");

  const toggleSearch = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
      if (isExpanded) setValue("");
    }
  };

  // Renderizar solo el icono en móvil cuando no está expandido
  if (isMobile && !isExpanded) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSearch}
        aria-label="Abrir búsqueda"
      >
        <SearchIcon className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <form
      className={`relative flex items-center ${isMobile ? "w-full" : "w-full lg:w-[400px]"}`}
      onSubmit={onSubmit}
    >
      <Input
        ref={inputRef}
        placeholder="Search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus={isMobile}
        className="pr-10"
      />
      
      {value && (
        <X
          className="absolute right-12 h-5 w-5 text-muted-foreground cursor-pointer hover:opacity-75 transition"
          onClick={onClear}
        />
      )}
      
      <Button
        type={isMobile ? "button" : "submit"}
        size="icon"
        variant="ghost"
        className="absolute right-2"
        onClick={isMobile ? toggleSearch : undefined}
        aria-label={isMobile ? "Cerrar búsqueda" : "Buscar"}
      >
        {isMobile ? (
          <X className="h-5 w-5" />
        ) : (
          <SearchIcon className="h-5 w-5" />
        )}
      </Button>
    </form>
  );
}

export default Search;