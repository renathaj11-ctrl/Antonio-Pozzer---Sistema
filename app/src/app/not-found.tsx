import Link from "next/link";

export default function NotFound() {
  return (
    <main className="simple-page">
      <div className="simple-card" style={{ textAlign: "center" }}>
        <div className="brand-mark" style={{ margin: "0 auto 16px" }} aria-hidden="true">UK</div>
        <h1>Registro não encontrado</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          O caso solicitado não existe ou você não tem permissão para acessá-lo.
        </p>
        <div className="row" style={{ justifyContent: "center", marginTop: 18 }}>
          <Link className="btn btn-primary" href="/painel">Voltar ao painel</Link>
          <Link className="btn" href="/casos">Ver casos</Link>
        </div>
      </div>
    </main>
  );
}
