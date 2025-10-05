import { NextResponse } from "next/server";
import axios from "axios";
import qs from "qs";

export async function POST(req: Request) {
  try {
    const { mId, mName } = await req.json();

    const dToken = process.env.LOVENSE_DEVELOPER_TOKEN;

    if (!dToken) {
      return new NextResponse("Developer token not configured", { status: 500 });
    }

    const data = qs.stringify({
      dToken: dToken,
      mInfo: JSON.stringify({ mId, mName }),
    });

    const config = {
      method: "post",
      url: "https://api.lovense-api.com/api/cam/model/getToken",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    const response = await axios(config);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("[LOVENSE_GET_TOKEN_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}