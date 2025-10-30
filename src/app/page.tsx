
'use client';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role:'user'|'assistant', content:string}[]>([]);
  const recRef = useRef<any>(null);
  const [listening, setListening] = useState(false);

  useEffect(()=>{
    // Basic handsfree via Web Speech API (Chrome/Edge). iOS Safari partial.
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'sv-SE';
      rec.onresult = (e:any)=>{
        const text = Array.from(e.results).map((r:any)=>r[0].transcript).join(' ');
        setInput(prev => (prev ? prev + ' ' : '') + text);
      };
      rec.onend = ()=> setListening(false);
      recRef.current = rec;
    }
  }, []);

  const toggleMic = () => {
    if (!recRef.current) return alert('Web Speech API saknas i din browser.');
    if (listening) { recRef.current.stop(); setListening(false); }
    else { recRef.current.start(); setListening(true); }
  };

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role:'user' as const, content: input };
    setMessages(m => [...m, userMsg]);
    setInput('');
    const res = await fetch('/api/chat', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ message: userMsg.content })});
    const data = await res.json();
    setMessages(m => [...m, { role:'assistant', content: data.reply || '—' }]);
  };

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">🐸 Grodan</h1>
      <p className="opacity-80">Multi-agent “headmaster”, minne (personligt + publikt), och påminnelser.</p>

      <div className="space-y-2">
        <textarea value={input} onChange={e=>setInput(e.target.value)} rows={4} className="w-full p-3 rounded text-black" placeholder="Säg eller skriv till Grodan…" />
        <div className="flex gap-2">
          <button onClick={send} className="px-4 py-2 rounded bg-emerald-500 text-black font-semibold">Skicka</button>
          <button onClick={toggleMic} className="px-4 py-2 rounded bg-neutral-800 border border-neutral-700">{listening ? '🎙️ Stoppa' : '🎙️ Röst'}</button>
        </div>
      </div>

      <div className="space-y-3">
        {messages.map((m,i)=>(
          <div key={i} className={`p-3 rounded ${m.role==='user'?'bg-neutral-800':'bg-neutral-900'}`}>
            <div className="text-sm opacity-70">{m.role==='user'?'Du':'Grodan'}</div>
            <div>{m.content}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
