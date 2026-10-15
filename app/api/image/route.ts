import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { getOpenAI, IMAGE_MODEL } from "@/lib/openai";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, amount = 1, resolution = "1024x1024" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse("OpenAI API Key not configured", { status: 500 });
    }

    if (!prompt) {
      return new NextResponse("Missing prompt", { status: 400 });
    }

    if (!amount) {
      return new NextResponse("Missing amount", { status: 400 });
    }

    if (!resolution) {
      return new NextResponse("Missing resolution", { status: 400 });
    }

    const isAllowed = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!isAllowed && !isPro) {
      return new NextResponse("API Limit Exceeded", { status: 403 });
    }

    const response = await getOpenAI().images.generate({
      model: IMAGE_MODEL,
      prompt,
      n: parseInt(amount, 10),
      size: resolution,
      output_format: "webp",
    });

    // GPT image models return base64 only; send data URLs so the client keeps reading `url`.
    const images = (response.data ?? []).map((image) => ({
      url: `data:image/webp;base64,${image.b64_json}`,
    }));

    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json(images, { status: 200 });
  } catch (error) {
    console.log("[IMAGE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
