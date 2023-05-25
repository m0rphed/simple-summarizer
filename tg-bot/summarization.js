import { AutoModelForSeq2SeqLM, AutoTokenizer } from '@xenova/transformers';

export const getTextSummary = async (text) => {
    // should model name be a function parameter?
    const modelName = 'Xenova/t5-base';

    // do the magic 🪄
    const tokenizer = await AutoTokenizer.from_pretrained(modelName);
    const model = await AutoModelForSeq2SeqLM.from_pretrained(modelName);

    const { input_ids } = await tokenizer(`summarize: ${text}`);
    const outputs = await model.generate(input_ids);
    const summary = tokenizer.decode(outputs[0][0], { skip_special_tokens: true });

    return summary;
};
