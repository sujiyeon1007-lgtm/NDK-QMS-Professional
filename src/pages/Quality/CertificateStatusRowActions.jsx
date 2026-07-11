import { PrimaryButton } from "../../foundation/components/Button";
import TitanTableRowActions from "../../foundation/components/TitanTableRowActions";

export default function CertificateStatusRowActions({ onReissue, canReissue = true }) {
  return (
    <TitanTableRowActions>
      <PrimaryButton
        type="button"
        className="titan-btn--table-action"
        disabled={!canReissue}
        onClick={(event) => {
          event.stopPropagation();
          if (canReissue) onReissue?.();
        }}
      >
        {"\uC7AC\uBC1C\uD589"}
      </PrimaryButton>
    </TitanTableRowActions>
  );
}
