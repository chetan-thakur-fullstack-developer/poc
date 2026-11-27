// Supabase REST client — uses fetch directly, zero dependencies, never crashes

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co') &&
    Boolean(supabaseAnonKey) &&
    supabaseAnonKey.length > 10
  );
};

// Minimal Supabase REST client using fetch — no npm package needed
const makeClient = (url, key) => {
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const restUrl = `${url}/rest/v1`;
  const authUrl = `${url}/auth/v1`;

  const authFetch = async (path, opts = {}) => {
    const res = await fetch(`${authUrl}${path}`, { ...opts, headers: { ...headers, ...opts.headers } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { data: null, error: data };
    return { data, error: null };
  };

  const from = (table) => ({
    select: (cols = '*') => ({
      eq: (col, val) => ({
        order: (by, opts2 = {}) => ({
          async then(resolve) {
            const qs = `${cols}&${col}=eq.${val}&order=${by}.${opts2.ascending === false ? 'desc' : 'asc'}`;
            const r = await fetch(`${restUrl}/${table}?select=${qs}`, { headers });
            const d = await r.json().catch(() => []);
            resolve({ data: Array.isArray(d) ? d : [], error: r.ok ? null : d });
          }
        }),
        maybeSingle: async () => {
          const r = await fetch(`${restUrl}/${table}?select=${cols}&${col}=eq.${val}&limit=1`, { headers: { ...headers, Accept: 'application/vnd.pgrst.object+json' } });
          if (r.status === 406 || r.status === 404) return { data: null, error: null };
          const d = await r.json().catch(() => null);
          return { data: r.ok ? d : null, error: r.ok ? null : d };
        },
        async then(resolve) {
          const r = await fetch(`${restUrl}/${table}?select=${cols}&${col}=eq.${val}`, { headers });
          const d = await r.json().catch(() => []);
          resolve({ data: Array.isArray(d) ? d : [], error: r.ok ? null : d });
        }
      }),
      limit: (n) => ({
        async then(resolve) {
          const r = await fetch(`${restUrl}/${table}?select=${cols}&limit=${n}`, { headers });
          const d = await r.json().catch(() => []);
          resolve({ data: Array.isArray(d) ? d : [], error: r.ok ? null : d });
        }
      }),
      async then(resolve) {
        const r = await fetch(`${restUrl}/${table}?select=${cols}`, { headers });
        const d = await r.json().catch(() => []);
        resolve({ data: Array.isArray(d) ? d : [], error: r.ok ? null : d });
      }
    }),
    upsert: async (body, opts2 = {}) => {
      const conflict = opts2.onConflict ? `?on_conflict=${opts2.onConflict}` : '';
      const r = await fetch(`${restUrl}/${table}${conflict}`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(body)
      });
      const d = await r.json().catch(() => null);
      return { data: d, error: r.ok ? null : d };
    },
    delete: () => ({
      eq: (col, val) => ({
        eq: (col2, val2) => ({
          async then(resolve) {
            const r = await fetch(`${restUrl}/${table}?${col}=eq.${val}&${col2}=eq.${val2}`, { method: 'DELETE', headers });
            resolve({ error: r.ok ? null : await r.json().catch(() => ({})) });
          }
        }),
        async then(resolve) {
          const r = await fetch(`${restUrl}/${table}?${col}=eq.${val}`, { method: 'DELETE', headers });
          resolve({ error: r.ok ? null : await r.json().catch(() => ({})) });
        }
      })
    })
  });

  const auth = {
    getSession: async () => {
      // Check localStorage for existing session token
      try {
        const stored = localStorage.getItem('ew_sb_session');
        if (stored) {
          const session = JSON.parse(stored);
          if (session?.access_token && session?.expires_at > Date.now() / 1000) {
            return { data: { session }, error: null };
          }
        }
      } catch {}
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: (cb) => {
      // Fire once with current state
      auth.getSession().then(({ data: { session } }) => cb('INITIAL', session));
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signUp: async ({ email, password, options }) => {
      const r = await authFetch('/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, data: options?.data || {} })
      });
      if (r.error) return r;
      if (r.data?.access_token) {
        const session = { ...r.data, expires_at: Date.now() / 1000 + (r.data.expires_in || 3600) };
        localStorage.setItem('ew_sb_session', JSON.stringify(session));
        return { data: { user: r.data.user, session }, error: null };
      }
      return { data: r.data, error: null };
    },
    signInWithPassword: async ({ email, password }) => {
      const r = await authFetch('/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (r.error) return r;
      const session = { ...r.data, expires_at: Date.now() / 1000 + (r.data.expires_in || 3600) };
      localStorage.setItem('ew_sb_session', JSON.stringify(session));
      return { data: { user: r.data.user, session }, error: null };
    },
    signOut: async () => {
      const stored = localStorage.getItem('ew_sb_session');
      if (stored) {
        const session = JSON.parse(stored);
        await authFetch('/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` }
        }).catch(() => {});
      }
      localStorage.removeItem('ew_sb_session');
      return { error: null };
    }
  };

  return { from, auth };
};

// Export supabase client — null if not configured (app works in demo mode)
export const supabase = isSupabaseConfigured() ? makeClient(supabaseUrl, supabaseAnonKey) : null;

export const checkSupabaseConnection = async () => {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (JWT anon key starting with eyJ) to GitHub Secrets.'
    };
  }
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) return { success: false, message: `Query error: ${JSON.stringify(error)}` };
    return { success: true, message: 'Connected to Supabase!' };
  } catch (err) {
    return { success: false, message: `Connection error: ${err.message}` };
  }
};
