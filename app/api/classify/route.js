import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: { 
    "HTTP-Referer": `${process.env.VERCEL_URL || 'http://localhost:3000'}`,
    "X-Title": "Pantry Tracker"
  },
});

export async function POST(req) {
  try {
    const { imageURL } = await req.json();
    console.log('Received imageURL:', imageURL);

    if (!imageURL) {
      return new Response(JSON.stringify({ error: 'Image URL is required' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Here you need to make sure the API call is correct for image classification
    console.log('Starting image classification...');
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: "system", content: "You are an AI assistant capable of analyzing images based on their URL." },
        // { role: "user", content: `Please analyze and classify the object in this image and give me a 
        //   one word answer with the name of the item in the image and don't include punctuation marks: ${imageURL}` }
        { role: "user", content: [
          {
            type: "text",
            text: `Please analyze and classify the object in this image and give me a \
            one word answer with the name of the item in the image and don't include punctuation marks: ${imageURL}`,
          },
          {
            type: "image_url",
            image_url: {
              url: `${imageURL}`,
              detail: "low",
            }
          }
        ]}
      ],
      max_tokens: 1000,
      headers: {
        'HTTP-Referer': `${process.env.VERCEL_URL || 'http://localhost:3000'}`,
        'X-Title': 'Pantry Tracker'
      },
    });
    console.log('API response:', completion);

    const classifiedItem = completion.choices[0].message.content;

    console.log('API response:', classifiedItem);

    return new Response(JSON.stringify({ classifiedItem }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error classifying image:', error);
    return new Response(JSON.stringify({ 
      error: 'Error classifying image', 
      details: error.message,
      stack: error.stack 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}
