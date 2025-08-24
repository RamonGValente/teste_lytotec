
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmEmailRequest {
  email: string;
  setTemporaryPassword?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { email, setTemporaryPassword = false }: ConfirmEmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`🔧 [ADMIN-CONFIRM-EMAIL] Processando: ${email}`);

    // Buscar o usuário pelo email
    const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (getUserError) {
      console.error("❌ Erro ao buscar usuários:", getUserError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar usuário" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado no Auth" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`✅ [ADMIN-CONFIRM-EMAIL] Usuário encontrado: ${user.id}`);

    // Confirmar o email do usuário
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (updateError) {
      console.error("❌ Erro ao confirmar email:", updateError);
      return new Response(
        JSON.stringify({ error: "Erro ao confirmar email" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`✅ [ADMIN-CONFIRM-EMAIL] Email confirmado para: ${email}`);

    // Se solicitado, definir senha temporária
    let temporaryPassword = null;
    if (setTemporaryPassword) {
      // Gerar senha temporária segura
      temporaryPassword = `Temp${Math.random().toString(36).slice(2)}${Date.now().toString().slice(-4)}!`;
      
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: temporaryPassword }
      );

      if (passwordError) {
        console.error("❌ Erro ao definir senha temporária:", passwordError);
        // Não falhar completamente, apenas avisar
        console.warn("⚠️ Email confirmado, mas senha temporária não foi definida");
      } else {
        console.log(`🔑 [ADMIN-CONFIRM-EMAIL] Senha temporária definida para: ${email}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email ${email} confirmado com sucesso`,
        user_id: user.id,
        temporary_password: temporaryPassword,
        has_password: temporaryPassword ? true : false
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ Erro na função admin-confirm-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
