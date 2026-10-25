"use client";

import { useId } from "react";
import type { Character, Status } from "@/lib/character";
import { characterSvg } from "@/lib/characterSvg";

/**
 * Vẽ nhân vật đại diện. Hình vuông; khung tròn do nơi dùng cắt.
 * `close`: cắt sát mặt cho cỡ nhỏ. `status`: đồ vật trong tay theo trạng thái (chỉ ảnh lớn, kiểu hoạt hình).
 */
export function CharacterArt({ c, className, close = false, status = null }: { c: Character; className?: string; close?: boolean; status?: Status | null }) {
  const id = `ch${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const { viewBox, body, pixel } = characterSvg(c, { id, close, status });
  return (
    <svg
      viewBox={viewBox}
      className={className}
      aria-hidden="true"
      shapeRendering={pixel ? "crispEdges" : undefined}
      // Nội dung chỉ sinh từ các lựa chọn có sẵn (màu, kiểu tóc, phụ kiện), không có chữ người dùng nhập.
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
