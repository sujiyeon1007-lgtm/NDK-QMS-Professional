const fs=require("fs");const f="c:/Users/user1/Desktop/NDK-QMS-Professional/src/pages/Environment/EnvironmentSections.jsx";let s=fs.readFileSync(f,"utf8");
const start=s.indexOf("export function NumberingSection()");
const end=s.indexOf("function resolveMenuGroup", start);
if(start<0||end<0) throw 1;
const newFn=`export function NumberingSection() {
  const [prefixes, setPrefixes] = useState(() => getNumberingPrefixes());
  const [message, setMessage] = useState("");

  const ruleRows = useMemo(() => getNumberingRuleRows("DS"), [prefixes]);
  const prefixRows = useMemo(
    () => Object.values(TITAN_DOCUMENT_NUMBER_TYPES).map((item) => ({ id: item.id, label: item.label, example: item.example })),
    []
  );

  const columns = useMemo(
    () => [
      { key: "category", label: "구분" },
      { key: "prefix", label: "접두어" },
      { key: "format", label: "번호 규칙" },
      { key: "example", label: "예시 (DS)" },
      { key: "source", label: "적용 화면" },
      {
        key: "status",
        label: "상태",
        render: (row) => (
          <span className={\`status-badge \${row.status === "운영" ? "사용" : "미사용"}\`}>{row.status}</span>
        ),
      },
    ],
    []
  );

  const handlePrefixChange = (type, value) => {
    setPrefixes((prev) => ({ ...prev, [type]: String(value ?? "").trim().toUpperCase() }));
  };

  const handleSave = () => {
    saveNumberingPrefixes(prefixes);
    setMessage("번호체계 접두어를 저장했습니다.");
  };

  const handleReset = () => {
    const next = resetNumberingPrefixes();
    setPrefixes(next.prefixes);
    setMessage("기본 접두어로 초기화했습니다.");
  };

  return (
    <SettingsPanel
      title="번호체계"
      desc={\`문서·관리번호 자동채번 규칙 — 패턴 \${TITAN_NUMBERING_PATTERN}\`}
    >
      <p className="environment-form-note">
        거래처 약칭 + 접두어 + 4자리 순번 · 제품 등록 시 <strong>DS-P-0001</strong> 형식 자동 생성
      </p>
      <p className="environment-form-note">
        LOT 형식 검증 패턴: <code>{NDK_PRODUCTION_LOT_PATTERN.source}</code>
      </p>

      <h4 className="environment-subtitle">접두어 설정</h4>
      <div className="environment-form-grid">
        {prefixRows.map((row) => (
          <label key={row.id} className="environment-form-field">
            <span>{row.label}</span>
            <input
              type="text"
              value={prefixes[row.id] ?? ""}
              onChange={(event) => handlePrefixChange(row.id, event.target.value)}
              placeholder={row.example.split("-")[1] ?? "P"}
            />
            <small>{row.example}</small>
          </label>
        ))}
      </div>

      <div className="environment-backup-actions">
        <PrimaryButton type="button" onClick={handleSave}>저장</PrimaryButton>
        <SecondaryButton type="button" onClick={handleReset}>기본값 복원</SecondaryButton>
      </div>
      {message ? <p className="environment-form-note">{message}</p> : null}

      <h4 className="environment-subtitle">운영 번호 규칙 미리보기</h4>
      <div className="environment-table-wrap">
        <TitanDataTable columns={columns} rows={ruleRows} getRowId={(row) => row.id} ariaLabel="번호체계 규칙" />
      </div>
    </SettingsPanel>
  );
}

`;
s = s.slice(0,start) + newFn + s.slice(end);
fs.writeFileSync(f,s);console.log('NumberingSection replaced');
