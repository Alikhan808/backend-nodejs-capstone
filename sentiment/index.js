require('dotenv').config();
const express=require('express');
const natural=require('natural');
const app=express();app.use(express.json({limit:'16kb'}));
const analyzer=new natural.SentimentAnalyzer('English',natural.PorterStemmer,'afinn');
app.post('/sentiment', (req,res)=>{
 const {sentence}=req.body;
 if(typeof sentence!=='string'||!sentence.trim())return res.status(400).json({error:'A sentence is required'});
 try{const sentimentScore=analyzer.getSentiment(new natural.WordTokenizer().tokenize(sentence));res.json({sentimentScore,sentiment:sentimentScore>0?'positive':sentimentScore<0?'negative':'neutral'});}catch(e){res.status(500).json({message:'Error performing sentiment analysis'});}
});
if(require.main===module)app.listen(process.env.PORT||3000);
module.exports=app;
