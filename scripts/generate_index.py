import re

with open('Mainbackup.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# 1. SPA redirect snippet
spa_snippet = '''<meta charset="UTF-8">
<!-- SPA routing for GitHub Pages: redirect /?/ URLs back to real paths -->
<script type="text/javascript">
  (function(l) {
    if (l.search && l.search[1] === '/') {
      var decoded = l.search.slice(1).split('&').map(function(s) {
        return s.replace(/~and~/g, '&');
      }).join('?');
      window.history.replaceState(null, null,
        l.pathname.slice(0, -1) + decoded + l.hash
      );
    }
  }(window.location));
</script>'''
assert '<meta charset="UTF-8">' in content, 'charset meta missing'
content = content.replace('<meta charset="UTF-8">', spa_snippet, 1)

# 2. Interactive CSS
interactive_css = '''
/* ═══════════════════════════════════════════════════════════
   USER PERSPECTIVE INTERACTIVITY & POLISH ENHANCEMENTS
   ═══════════════════════════════════════════════════════════ */

/* Smooth tab switching animation */
@keyframes ewTabFadeSlide {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.main-tab-content:not(.hidden) {
  animation: ewTabFadeSlide 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Tactile button active states */
.btn, .btn-icon, .chip, .demo-pill, .popover-item {
  transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease !important;
}
.btn:active, .btn-icon:active, .chip:active, .demo-pill:active {
  transform: scale(0.97) !important;
}

/* Card hover lift & glow */
.surface, .settings-card, .metric-card, .dash-card {
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease !important;
}
.surface:hover, .settings-card:hover {
  border-color: var(--border-hover) !important;
}

/* Interactive focus rings for accessibility */
.input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18) !important;
}

/* Shake animation on auth error */
@keyframes ewErrorShake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}
.auth-msg.error {
  animation: ewErrorShake 0.35s ease-in-out !important;
}
'''
assert '</style>' in content, '</style> missing'
content = content.replace('</style>', interactive_css + '\n</style>', 1)

# 3. Header Demo Chip
header_chip_needle = '<button class="plan-chip free" id="headerPlanChip" onclick="switchMainTab(null,\'tab-pricing\',true)" title="View plans & pricing">'
demo_header_chip = '''<div id="demoHeaderChip" class="hidden items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shrink-0" title="Demo mode active with full Pro features preview">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Demo Mode</span>
              <button onclick="signOut()" class="text-[10px] text-emerald-300 hover:text-white underline ml-1 cursor-pointer" title="Sign out to return to login page">Exit</button>
            </div>
            ''' + header_chip_needle
assert header_chip_needle in content, 'headerPlanChip missing'
content = content.replace(header_chip_needle, demo_header_chip, 1)

# 4. Auth View Enhancement
old_auth_signin = '''      <div class="space-y-3">
        <div><label class="field-label">Email or Username<span class="req-mark">*</span></label><input type="text" id="authSigninIdentifier" class="input" placeholder="you@example.com" autocomplete="username"></div>
        <div><label class="field-label">Password<span class="req-mark">*</span></label><input type="password" id="authSigninPassword" class="input" placeholder="••••••••" autocomplete="current-password"></div>
        <label class="flex items-center gap-2 cursor-pointer text-[11px] font-semibold" style="color:var(--text-2);"><input type="checkbox" id="authSigninRemember" checked style="accent-color:var(--accent);"> Remember this device</label>
        <div id="authSigninMsg" class="hidden"></div>
        <button onclick="attemptSignin(this)" class="btn btn-primary w-full !py-2.5"><i data-lucide="log-in" class="w-3.5 h-3.5"></i> Sign In</button>
        <div class="pt-3 text-center" style="border-top:1px solid var(--border);">
          <button onclick="seedDemoAccount()" class="text-[11px] font-bold hover:underline" style="color:#6D28D9;">Use demo credentials (demo@execwealth.local / demo123)</button>
        </div>
      </div>'''

new_auth_signin = '''      <div class="space-y-3">
        <div>
          <label class="field-label">Email or Username<span class="req-mark">*</span></label>
          <input type="text" id="authSigninIdentifier" class="input" placeholder="you@example.com" autocomplete="username" onkeydown="if(event.key===\'Enter\')document.getElementById(\'authSigninPassword\')?.focus()">
        </div>
        <div>
          <label class="field-label">Password<span class="req-mark">*</span></label>
          <div class="relative">
            <input type="password" id="authSigninPassword" class="input !pr-10" placeholder="••••••••" autocomplete="current-password" onkeydown="if(event.key===\'Enter\')attemptSignin(this)">
            <button type="button" onclick="togglePasswordVisibility(\'authSigninPassword\', this)" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-1)] p-1 cursor-pointer transition-colors" title="Toggle password visibility">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer text-[11px] font-semibold" style="color:var(--text-2);"><input type="checkbox" id="authSigninRemember" checked style="accent-color:var(--accent);"> Remember this device</label>
          <span class="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Pro Sandbox</span>
        </div>
        <div id="authSigninMsg" class="hidden"></div>
        <button onclick="attemptSignin(this)" class="btn btn-primary w-full !py-2.5 active:scale-[0.98] transition-all hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer">
          <i data-lucide="log-in" class="w-3.5 h-3.5"></i> Sign In
        </button>
        
        <!-- Interactive Demo Account Access Section -->
        <div class="pt-3 mt-3" style="border-top:1px solid var(--border);">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-bold" style="color:var(--text-2);">Quick Demo Experience</span>
            <span class="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Instant</span>
          </div>
          <button type="button" onclick="quickLaunchDemo(this)" class="btn w-full !py-2.5 !text-xs !font-bold flex items-center justify-center gap-2 rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98]" style="background:linear-gradient(135deg, rgba(16,185,129,.15), rgba(99,102,241,.15)); border:1px solid rgba(16,185,129,.35); color:var(--text-1); box-shadow:0 2px 10px rgba(0,0,0,0.12);">
            <i data-lucide="sparkles" class="w-4 h-4" style="color:#10B981;"></i>
            <span>Launch Full Demo Workspace</span>
          </button>
          <div class="mt-2 text-center">
            <button type="button" onclick="seedDemoAccount()" class="text-[11px] font-semibold hover:underline transition-colors cursor-pointer" style="color:#8B5CF6;">Prefill credentials (demo@execwealth.local / demo123)</button>
          </div>
        </div>
      </div>'''

assert old_auth_signin in content, 'old_auth_signin missing'
content = content.replace(old_auth_signin, new_auth_signin, 1)

# 5. Signup Password Visibility & Enter Key
old_auth_signup_pw = '<div><label class="field-label">Password<span class="req-mark">*</span></label><input type="password" id="authSignupPassword" class="input" placeholder="Minimum 6 characters" autocomplete="new-password"></div>'
new_auth_signup_pw = '''<div>
          <label class="field-label">Password<span class="req-mark">*</span></label>
          <div class="relative">
            <input type="password" id="authSignupPassword" class="input !pr-10" placeholder="Minimum 6 characters" autocomplete="new-password" onkeydown="if(event.key===\'Enter\')attemptSignup(this)">
            <button type="button" onclick="togglePasswordVisibility(\'authSignupPassword\', this)" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-1)] p-1 cursor-pointer transition-colors" title="Toggle password visibility">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
          </div>
        </div>'''
assert old_auth_signup_pw in content, 'old_auth_signup_pw missing'
content = content.replace(old_auth_signup_pw, new_auth_signup_pw, 1)

# 6. Add JS helper functions for demo launch and password toggle
helpers_code = '''
function togglePasswordVisibility(inputId, btn){
  const inp = $id(inputId);
  if(!inp) return;
  const isPw = inp.type === 'password';
  inp.type = isPw ? 'text' : 'password';
  if(btn){
    btn.innerHTML = `<i data-lucide="${isPw ? 'eye-off' : 'eye'}" class="w-4 h-4"></i>`;
    if(typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function quickLaunchDemo(btn){
  if(btn){
    btn.disabled = true;
    btn.innerHTML = `<span class="inline-block animate-spin mr-2">⟳</span> Initializing Demo Workspace...`;
  }
  const user = { id:'u_demo', name:'Demo User', email:'demo@execwealth.local', passwordHash:hashPassword('demo123'), role:'owner', householdId:'hh_demo', createdAt:new Date().toISOString() };
  authState.user = user;
  authState.session = { token:'s_' + Date.now(), createdAt:new Date().toISOString() };
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, session:authState.session }));
    householdState.members = [{ id:user.id, name:user.name, email:user.email, role:'owner', joinedAt:user.createdAt }];
    householdState.inviteCode = householdState.inviteCode || generateInviteCode();
    persistHouseholdState();
    
    appSettings.profile.name = user.name;
    appSettings.profile.email = user.email;
    appSettings.signIn.username = 'demo';
    persistAppSettings();
  } catch(e){ console.warn('Demo persistence error:', e); }

  showAuthMsg('authSigninMsg', 'Welcome to the Demo Experience! Loading your workspace...', 'success');
  setTimeout(() => {
    enterApp();
  }, 400);
}

function updateDemoHeaderUI(){
  const chip = $id('demoHeaderChip');
  if(!chip) return;
  const isDemo = (typeof isDemoSession === 'function' && isDemoSession());
  if(isDemo){
    chip.classList.remove('hidden');
    chip.classList.add('flex');
  } else {
    chip.classList.remove('flex');
    chip.classList.add('hidden');
  }
}
'''
assert 'function seedDemoAccount(){' in content, 'seedDemoAccount missing'
content = content.replace('function seedDemoAccount(){', helpers_code + '\nfunction seedDemoAccount(){', 1)

# 7. Call updateDemoHeaderUI in bootApp
assert 'updateFeatureLocksInApp();' in content, 'updateFeatureLocksInApp missing'
content = content.replace('updateFeatureLocksInApp();', 'updateFeatureLocksInApp(); updateDemoHeaderUI();', 1)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Successfully wrote enhanced index.html ({len(content)} bytes, {content.count(chr(10))} lines)')
