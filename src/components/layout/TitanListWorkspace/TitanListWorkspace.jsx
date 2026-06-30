function TitanListWorkspace({ className = "", primary, side }) {
  const rootClass = ["titan-list-workspace", className].filter(Boolean).join(" ");

  return (
    <section className={rootClass}>
      {primary}
      <aside className="titan-list-side">{side}</aside>
    </section>
  );
}

export default TitanListWorkspace;
