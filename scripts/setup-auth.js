// Script to create initial auth users
// Run with: node scripts/setup-auth.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const USERS = {
  'Arti': { role: 'Contabilidad', area: 'Contabilidad/Operaciones' },
  'Vikio': { role: 'Coordinación', area: 'Coordinación' },
  'Vixo': { role: 'Estrategia', area: 'Estrategia/Marketing' },
  'Joaco': { role: 'Dirección', area: 'Dirección de Arte/Contenido' }
}

const SHARED_PASSWORD = '24042024'

async function setupUsers() {
  console.log('🚀 Setting up TeamCollab users...')

  for (const [username, config] of Object.entries(USERS)) {
    const email = `${username.toLowerCase()}@teamcollab.internal`
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: SHARED_PASSWORD,
        email_confirm: true,
        user_metadata: {
          username: username
        }
      })

      if (authError) {
        console.error(`❌ Error creating auth user ${username}:`, authError.message)
        continue
      }

      console.log(`✅ Created auth user: ${username}`)

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          auth_user_id: authData.user.id,
          username,
          role: config.role,
          area: config.area
        })

      if (profileError) {
        console.error(`❌ Error creating profile for ${username}:`, profileError.message)
        continue
      }

      console.log(`✅ Created profile: ${username} (${config.role})`)

    } catch (error) {
      console.error(`❌ Unexpected error for ${username}:`, error.message)
    }
  }

  console.log('🎉 User setup complete!')
  console.log('\n📝 Credentials:')
  console.log('Users: Arti, Vikio, Vixo, Joaco')
  console.log('Password: 24042024')
}

setupUsers().catch(console.error)