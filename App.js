const { useState, useEffect } = React;

function App() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [product, setProduct] = useState('');
  const [consent, setConsent] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load products from products.json
  useEffect(() => {
    fetch('/products.json')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error loading products:', error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !product || !consent) {
      setMessage('Please fill all fields and consent.');
      return;
    }
    // E.164 validation: starts with +, 10-15 digits
    if (!/^\+[1-9]\d{9,14}$/.test(phone)) {
      setMessage('Phone must be in E.164 format (e.g., +1234567890).');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/submit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, product, consent: consent ? 1 : 0 }),
      });
      const data = await response.json();
      setMessage(data.message || 'Submission successful!');
    } catch (error) {
      setMessage('Error submitting form. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6 transform transition-all hover:scale-105">
        <h1 className="text-3xl font-bold text-center text-gray-800">Premium Form</h1>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number (E.164)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
            placeholder="+1234567890"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Injectable Product</label>
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
            required
          >
            <option value="">Select a product</option>
            {products.map((prod) => (
              <option key={prod.id} value={prod.name}>{prod.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            required
          />
          <label className="ml-2 text-sm text-gray-700">Consent to WhatsApp communication</label>
        </div>

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          } transition duration-300`}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>

        {message && (
          <p className={`text-center text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
