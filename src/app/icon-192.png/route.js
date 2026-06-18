import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function GET() {
  const S = 192;
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0e1a",
        }}
      >
        <div
          style={{
            display: "flex",
            width: S * 0.66,
            height: S * 0.66,
            borderRadius: "50%",
            background: "#2563eb",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: S * 0.48, height: S * 0.48, borderRadius: "50%", background: "#ffffff" }} />
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
