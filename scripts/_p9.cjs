const fs=require("fs");const f="c:/Users/user1/Desktop/NDK-QMS-Professional/src/pages/Settings/MasterDataRegisterModal.jsx";let s=fs.readFileSync(f,"utf8");
const renderFn=`  const renderProductField = (field) => {
    if (field.type === "companyAutocomplete") {
      return (
        <TitanSearchAutocomplete
          fieldKey="company"
          value={form.company ?? ""}
          onChange={(value) => updateField("company", value)}
          suggestions={optionMap.companies}
          placeholder={field.placeholder ?? "거래처 검색"}
        />
      );
    }
    if (field.type === "autoCode") {
      return (
        <MasterFieldInput
          field={{ ...field, type: "readonly" }}
          value={form.code ?? ""}
          onChange={() => {}}
          readOnly
          helperText={mode === "add" ? "업체 선택 시 자동 생성 · 수동 입력 불가" : "등록된 관리번호"}
        />
      );
    }
    if (field.type === "processCategory") {
      return (
        <select value={form.processCategory ?? ""} onChange={(event) => updateField("processCategory", event.target.value)}>
          <option value="">{field.placeholder ?? "공정 선택"}</option>
          {PRODUCT_PROCESS_CATEGORIES.map((item) => (
            <option key={item.id} value={item.id} disabled={item.enabled === false}>
              {item.label}
              {item.planned ? " (예정)" : ""}
            </option>
          ))}
        </select>
      );
    }
    if (field.type === "processDetail") {
      return (
        <select
          value={form.processDetail ?? ""}
          onChange={(event) => updateField("processDetail", event.target.value)}
          disabled={!form.processCategory}
        >
          <option value="">{field.placeholder ?? "세부공정 선택"}</option>
          {processDetailOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      );
    }
    return null;
  };

`;
const anchor="  if (!open || !screen) return null;";
if(s.includes("renderProductField")){console.log('skip render');process.exit(0);} 
if(!s.includes(anchor)) throw 1;
s=s.replace(anchor, renderFn + anchor);
const oldMap=`          const abbrevProps = getAbbreviationFieldProps(field);
          const fieldType = field.type === "abbreviation" ? "text" : field.type;
          return (
            <label
              key={field.key}
              className={\`master-register-modal__field\${field.span === 2 ? " span-2" : ""}\`}
            >
              <span>
                {field.label}
                {field.required ? " *" : ""}
              </span>
              <MasterFieldInput
                field={{ ...field, type: fieldType }}
                value={form[field.key] ?? ""}
                onChange={(value) => updateField(field.key, value)}
                options={field.optionsKey ? optionMap[field.optionsKey] ?? [] : []}
                readOnly={abbrevProps.readOnly}
                helperText={abbrevProps.helperText}
              />
            </label>
          );`;
const newMap=`          const abbrevProps = getAbbreviationFieldProps(field);
          const fieldType = field.type === "abbreviation" ? "text" : field.type;
          const productField = isProductScreen ? renderProductField(field) : null;
          return (
            <label
              key={field.key}
              className={\`master-register-modal__field\${field.span === 2 ? " span-2" : ""}\`}
            >
              <span>
                {field.label}
                {field.required ? " *" : ""}
              </span>
              {productField ?? (
                <MasterFieldInput
                  field={{ ...field, type: fieldType }}
                  value={form[field.key] ?? ""}
                  onChange={(value) => updateField(field.key, value)}
                  options={field.optionsKey ? optionMap[field.optionsKey] ?? [] : []}
                  readOnly={abbrevProps.readOnly}
                  helperText={abbrevProps.helperText}
                />
              )}
            </label>
          );`;
if(!s.includes(oldMap)) throw 2;
s=s.replace(oldMap,newMap);
fs.writeFileSync(f,s);console.log('ok9');
