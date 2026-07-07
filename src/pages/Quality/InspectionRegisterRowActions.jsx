import { SecondaryButton } from "../../foundation/components/Button";

import TitanTableRowActions from "../../foundation/components/TitanTableRowActions";



/** 검사관리 공통 — [등록] [수정] [삭제] (상세는 더블클릭) */

export default function InspectionRegisterRowActions({

  onRegister,

  onEdit,

  onDelete,

  canRegister = true,

  canEdit = true,

  canDelete = true,

}) {

  return (

    <TitanTableRowActions>

      <SecondaryButton

        type="button"

        className="titan-btn--table-action"

        aria-disabled={!canRegister}

        title={canRegister ? "검사등록" : "검사대기 상태에서만 등록할 수 있습니다"}

        onClick={(event) => {

          event.stopPropagation();

          if (!canRegister) {

            window.alert("검사대기 상태의 제품만 등록할 수 있습니다.");

            return;

          }

          onRegister?.();

        }}

      >

        등록

      </SecondaryButton>

      <SecondaryButton

        type="button"

        className="titan-btn--table-action"

        disabled={!canEdit}

        onClick={(event) => {

          event.stopPropagation();

          if (canEdit) onEdit?.();

        }}

      >

        수정

      </SecondaryButton>

      <SecondaryButton

        type="button"

        className="titan-btn--table-action"

        disabled={!canDelete}

        onClick={(event) => {

          event.stopPropagation();

          if (canDelete) onDelete?.();

        }}

      >

        삭제

      </SecondaryButton>

    </TitanTableRowActions>

  );

}

