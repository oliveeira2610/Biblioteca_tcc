import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function PagamentoMulta() {
  const { livroId } = useParams();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const [preferenceId, setPreferenceId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const criarPreferencia = async () => {
      try {
        const res = await fetch("http://localhost:3001/criar-preferencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo: "Pagamento de Multa",
            preco: 20, // Coloque aqui o valor real ou dinâmico
            livroId,
          }),
        });
        const data = await res.json();
        setPreferenceId(data.id);
      } catch (error) {
        console.error("Erro ao criar preferência:", error);
      } finally {
        setLoading(false);
      }
    };

    criarPreferencia();
  }, [livroId]);

  useEffect(() => {
    if (preferenceId) {
      const script = document.createElement("script");
      script.src = "https://www.mercadopago.com.br/integrations/v1/web-payment-checkout.js";
      script.type = "text/javascript";
      script.setAttribute("data-preference-id", preferenceId);
      script.setAttribute("data-button-label", "Pagar com Mercado Pago");
      document.getElementById("mercado-pago-btn")?.appendChild(script);
    }
  }, [preferenceId]);

  return (
    <div className="tela-pagamento">
      <h2>Pagamento de Multa</h2>

      {status === "sucesso" && <p>✅ Multa paga com sucesso!</p>}
      {status === "erro" && <p>❌ Erro ao processar pagamento.</p>}

      {!status && (
        <>
          <p>Valor da multa: R$ 20,00</p>
          {loading && <p>Carregando botão de pagamento...</p>}
          {!loading && <div id="mercado-pago-btn"></div>}
        </>
      )}
    </div>
  );
}
