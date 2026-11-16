import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { criarCaso } from "@/lib/actions/casos";
import { Alert, Card, Field } from "@/components/ui";

export const metadata = { title: "Novo caso" };

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function NovoCasoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await requireProfile();
  const sp = await searchParams;
  const erro = first(sp.erro);

  const supabase = await createServerSupabase();
  const { data: clinics } = await supabase
    .from("clinics")
    .select("id, name, city")
    .eq("active", true)
    .order("name");

  const clinicList = (clinics ?? []) as Array<{ id: string; name: string; city: string | null }>;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Abrir novo caso</h1>
          <p className="sub">Identificação do requerente e abertura do processo de triagem.</p>
        </div>
        <div className="topbar-actions">
          <Link className="btn" href="/casos">Cancelar</Link>
        </div>
      </header>

      <div className="content stack">
        {erro && <Alert tone="danger">{erro}</Alert>}

        {clinicList.length === 0 && (
          <Alert tone="warn">
            Nenhuma clínica ativa cadastrada. Execute a migração <code>0004_seed.sql</code> ou cadastre
            uma clínica em Configurações antes de abrir casos.
          </Alert>
        )}

        <form action={criarCaso} className="stack">
          <Card title="Identificação" subtitle="Os dados devem coincidir com o passaporte.">
            <div className="form-grid">
              <Field label="Nome completo" required className="span-2">
                <input type="text" name="full_name" required autoFocus autoComplete="off" />
              </Field>
              <Field label="Data de nascimento" required>
                <input type="date" name="date_of_birth" required />
              </Field>
              <Field label="Sexo">
                <select name="sex" defaultValue="">
                  <option value="">Não informado</option>
                  <option value="feminino">Feminino</option>
                  <option value="masculino">Masculino</option>
                  <option value="outro">Outro</option>
                </select>
              </Field>
              <Field label="Nacionalidade">
                <input type="text" name="nationality" placeholder="Ex.: brasileira" />
              </Field>
              <Field label="Categoria">
                <select name="category" defaultValue="adulto">
                  <option value="adulto">Adulto</option>
                  <option value="gestante">Gestante</option>
                  <option value="crianca">Criança (&lt; 11 anos)</option>
                </select>
              </Field>

              <Field label="Número do passaporte" required>
                <input type="text" name="passport_number" required autoComplete="off" className="mono" />
              </Field>
              <Field label="País emissor do passaporte">
                <input type="text" name="passport_country" placeholder="Ex.: Brasil" />
              </Field>
              <Field label="Emissão do passaporte">
                <input type="date" name="passport_issued_on" />
              </Field>
              <Field label="Validade do passaporte">
                <input type="date" name="passport_expires_on" />
              </Field>
            </div>
          </Card>

          <Card title="Contato" subtitle="Usado para reagendamentos e comunicação sobre o exame.">
            <div className="form-grid">
              <Field label="Telefone">
                <input type="tel" name="phone" />
              </Field>
              <Field label="E-mail">
                <input type="email" name="email" />
              </Field>
              <Field label="Endereço" className="span-2">
                <input type="text" name="address_line" />
              </Field>
              <Field label="Cidade">
                <input type="text" name="city" />
              </Field>
              <Field label="UF">
                <input type="text" name="state" maxLength={2} />
              </Field>
              <Field label="CEP">
                <input type="text" name="postcode" />
              </Field>
            </div>
          </Card>

          <Card title="Processo" subtitle="Configuração do caso e vínculo familiar.">
            <div className="form-grid">
              <Field label="Clínica" required>
                <select name="clinic_id" required defaultValue={clinicList[0]?.id ?? ""}>
                  {clinicList.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}{clinic.city ? ` — ${clinic.city}` : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Data de abertura" hint="O número UKTB-AAAA-NNNN é gerado automaticamente.">
                <input type="date" name="opened_on" defaultValue={today} />
              </Field>
              <Field label="Data da avaliação médica" hint="Pode ser preenchida depois.">
                <input type="date" name="assessment_date" />
              </Field>
              <Field
                label="Médico responsável"
                hint={profile.role === "medico" ? "Você será vinculado automaticamente." : "Opcional."}
              >
                <input
                  type="text"
                  name="assigned_physician"
                  placeholder={profile.role === "medico" ? profile.full_name : "Definir depois"}
                  disabled={profile.role === "medico"}
                />
              </Field>
              <Field
                label="Grupo familiar"
                hint="Preencha apenas se o caso fizer parte de uma família. Cria um grupo novo."
              >
                <input type="text" name="family_label" placeholder="Ex.: Família Silva — processo 2026" />
              </Field>
              <Field label="Observações administrativas">
                <textarea name="notes" rows={3} />
              </Field>
            </div>
          </Card>

          <div className="row-end">
            <Link className="btn" href="/casos">Cancelar</Link>
            <button className="btn btn-primary" type="submit">Criar caso e continuar</button>
          </div>
        </form>
      </div>
    </>
  );
}
