import { useState } from 'react';
import axios from 'axios';

function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/create_preference', {
        title: 'Multa',
        quantity: 1,
        price: 0.05,
      });

      window.location.href = response.data.init_point; // Redireciona para o link de pagamento
    } catch (err) {
      console.error('Erro ao criar preferência:', err);
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Finalizar Compra</h1>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Carregando...' : 'Pagar com Mercado Pago'}
      </button>
    </div>
  );
}

export default CheckoutPage;
