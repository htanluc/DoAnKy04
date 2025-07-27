import { useEffect, useState } from "react";

export interface Apartment {
  id: number | string;
  unitNumber: string;
}

export function useApartments() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch("http://localhost:8080/api/apartments", {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
      .then(res => res.json())
      .then(data => setApartments(Array.isArray(data) ? data : data.data))
      .finally(() => setLoading(false));
  }, []);

  return { apartments, loading };
} 