'use strict';

const express = require('express');
const morgan = require('morgan');
const {check, validationResult} = require('express-validator');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const data = require('./questionari');

// init express
const app = new express();
const port = 3001;

app.use(morgan('dev'));
app.use(express.json());

// Set up Passport

passport.use(new LocalStrategy(
  function(username, password, done) {
      data.getUser(username, password).then((user) => {
          if(!user) return done(null, false, { message: 'Incorrect username and/or password.' });
          return done(null, user);
      });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  data.getUserById(id).then((user) => { done(null, user); }).catch(err => { done(err, null); });
});

// set up logged features

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) return next();
  return res.status(401).json({error:'not authenticated'});
}

app.use(session({
  secret: 'secret sentence for exam app',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// --- API --- //

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// POST /api/sessions
//login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
      if (err)
          return next(err);
      if (!user) {
          // display wrong login messages
          return res.status(401).json(info);
      }
      // success, perform the login
      req.login(user, (err) => {
          if (err)
              return next(err);

          // req.user contains the authenticated user, we send all the user info back
          // this is coming from data.getUser()
          return res.json(req.user);
      });
  })(req, res, next);
});


// DELETE /api/sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout();
  res.end();
});

// GET /api/sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json(req.user.username);
  }
  else
    return res.status(401).json({ error: 'Unauthenticated user!' });;
});

// GET /api/surveys
app.get('/api/surveys', async (req, res) => {
  const surveys = await data.getAllSurveys()
  .then(surveys => res.json(surveys)).catch(() => res.status(503).end());
});

// GET /api/user/surveys
app.get('/api/user/surveys', isLoggedIn, async (req, res) =>{
  try{
    const surveys = await data.getUserSurveys(req.user.id);
    const newsurveys = [...surveys]
    for(const q of newsurveys){
      const number = await data.getSurveyAnswersNumber(q.id);
      q["number"] = number;
    }
    return res.json(newsurveys);
  }
  catch(err){
    return res.status(503).json(err);
  }
  //.then(surveys => res.json(surveys))
  //.catch(() => res.status(503).end());

});

// GET /api/surveys/:id
app.get('/api/surveys/:id', [check('id').isInt()], async (req,res) =>{
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  try{
    const survey = await data.getSurvey(req.params.id);
    if(survey===null){ return res.status(404).json(undefined); }
    else{
      const open = await data.getOpenQuestions(req.params.id);
      const closed = await data.getClosedQuestions(req.params.id);
      for(const c of closed){
        const options = await data.getOptions(c.id);
        c["options"] = options;
      }
      const questions = [];
      if(open.length>0) questions.push(...open);
      if(closed.length>0) questions.push(...closed);
      survey["questions"] = questions.map((q) => ({position: q.position, question: q})).sort((a,b) => { return a.position-b.position; });
      return res.json(survey);
    }
  } catch(err) {
    return res.status(503).json(err);
  }
});

// api/surveys/answers/:id
app.get('/api/surveys/answers/:id', [check('id').isInt()], async (req,res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  try{
    const survey = await data.getSurvey(req.params.id);
    if(survey===null){ return res.status(404).json(undefined); }
    else{
      const open = await data.getOpenQuestions(req.params.id);
      const closed = await data.getClosedQuestions(req.params.id);
      for(const c of closed){
        const options = await data.getOptions(c.id);
        c["options"] = options;
      }
      const questions = [];
      if(open.length>0) questions.push(...open);
      if(closed.length>0) questions.push(...closed);
      survey["questions"] = questions.map((q) => ({position: q.position, question: q})).sort((a,b) => { return a.position-b.position; });
      const compilations = await data.getCompilations(req.params.id);
      //const newcompilations = [];
      for(const comp of compilations){
        const newquestions = [];
        for(const q of survey["questions"]){
          const newquestion = { id: q.question.id, text: q.question.text, position: q.question.position }
          if(q.question["options"]!==undefined){
            const newoptions = []
            for(const opt of q.question["options"]){
              const newopt = await data.getClosedAnswer(comp.id, opt.id);
              if(newopt === undefined) newoptions.push({ id: opt.id, text: opt.text, value: 0 });
              else newoptions.push({ id: opt.id, text: opt.text, value: newopt.value });
            }
            newquestion["options"] = newoptions;
          }else{
            const opans = await data.getOpenAnswer(comp.id, q.question.id);
            if(opans === undefined) newquestion["answer"] = "";
            else newquestion["answer"] = opans.answer;
          }
          newquestions.push({position: newquestion.position, question: newquestion});
        }
        comp["questions"] = newquestions;
        comp["title"] = survey.title;
        /*
        //DEEP CLONE
        const newquestions = [];
        for(const oldq of survey["questions"]){
          const newquestion = { ...oldq }
          if(oldq.question["options"]!==undefined){
            const newoptions = []
            for(const oldopt of oldq.question["options"]){
              const newoption = { ...oldopt }
              newoptions.push(newoption);
            }
            newquestion["options"] = newoptions
          }
          newquestions.push(newquestion);
        }
        //create compilation
        comp["questions"] = newquestions
        const openans = await data.getOpenAnswers(comp.id);
        const closedans = await data.getClosedAnswers(comp.id);
        if(openans.length>0){
          for(const o of openans){
            const oq = await data.getOpenQuestion(o.questionId);
            const qind =  comp["questions"].findIndex( (q) => q.position === oq.position );
            //if(quind!==-1) 
            comp["questions"][qind]["question"]["answer"] = o.text;
          }
        }
        if(closedans.length>0){
          for(const cl of closedans){
            const opt = await data.getOption(cl.optionId);
            const cq = await data.getClosedQuestion(opt.questionId);
            const qind =  comp["questions"].findIndex( (q) => q.position === cq.position );
            //if(quind!==-1) 
            const oind =  comp["questions"][qind]["question"]["options"].findIndex( (opti) => opti.id === cl.optionId );
            comp["questions"][qind]["question"]["options"][oind]["value"] = cl.value;
          }
        }
        comp["title"] = survey.title;
        newcompilations.push({...comp});
        */
      }
      //res.json(newcompilations);
      return res.json(compilations);
    }
  }
  catch(err) {
    console.error(err);
    return res.status(503).json(err);
  }
});

// GET /api/teapot
app.get('/api/teapot', (req, res) =>{
  return res.status(418).end();
});

// POST /api/surveys/compile
app.post('/api/surveys/compile', [
  check('surveyId').isInt(),
  check('name').isString().isLength({min: 1 }),
  check('answers').custom((ans) => {
    if(! Array.isArray(ans)) return false;
    for(const a of ans){
      if(a["options"]!==undefined){
        if(! Array.isArray(a["options"])) return false;
        if(a["options"].length===0) return false;
        for(const o of a["options"]){
        if(typeof o["optionId"] !== 'number') return false;
        if(o["value"]!==undefined)
        if(typeof o["value"] !== 'boolean') return false;
        }
      }
      else{
        if(a["answer"]===undefined) return false;
        if(typeof a["answer"] !== 'string') return false;
        if(a["answer"].length===0) return false;
      }
      if(a["position"] === undefined) return false;
      if(typeof a["position"] !== 'number' ) return false;
    }
    return true;
  })
  ], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(422).json({errors: errors.array() });
    try{
      const survey = await data.getSurvey(req.body.surveyId);
      if(survey===null){ return res.status(422).json("survey not existing"); }
      const open = await data.getOpenQuestions(req.body.surveyId);
      const closed = await data.getClosedQuestions(req.body.surveyId);
      for(const c of closed){
        const options = await data.getOptions(c.id);
        c["options"] = options;
      }
      const questions = [];
      if(open.length>0) questions.push(...open);
      if(closed.length>0) questions.push(...closed);
      survey["questions"] = questions.map((q) => ({position: q.position, question: q})).sort((a,b) => { return a.position-b.position; });
      
      const answers = req.body.answers;
      let aind = -1;
      for(const q of questions){
          const chk = answers.filter( (a) => a.position === q.position );
          if(chk.length > 1) return res.status(422).json("two answers for the same position");
          const chk2 = answers.filter( (a) => a.questionId === q.id);
          if(chk2.length>1){
            const chk3 = chk2.filter((c)=>c["answer"]!==undefined);
            const chk4 = chk3.filter((c)=>c["options"]!==undefined);
            if(chk3.length>1) return res.status(422).json("two open answers for the same question");
            if(chk4.length>1) return res.status(422).json("two closed answers for the same question");
          }
          aind = answers.findIndex( (a) => a.position === q.position);
          if((q.required===1)&&((aind===-1)||(answers[aind]["answer"]===undefined))) return res.status(422).json("missing required open answer");
          if((q.min==1)&&((aind===-1)||(answers[aind]["options"]===undefined))) return res.status(422).json("missing required closed answer");
      }
      for(const a of answers){
        const qind = survey.questions.findIndex((q) => q.question.position === a.position);
        if(qind===-1) return res.status(422).json("answer for a non existing position");
        const chk5 = survey.questions.filter((q) => q.question.id === a.questionId);
        if(chk5.length===0) return res.status(422).json("answer for a non existing question");
        if(survey.questions[qind].question.max!==undefined){
          if(survey.questions[qind].question.max<a["options"].length) return res.status(422).json("max constraint violated for a closed question");
        }
        if(a["options"]!==undefined){
          const opts = a["options"];
          const qopts = survey.questions[qind]["question"]["options"];
          for(const o of opts){
            const oind = qopts.findIndex((q) => o.optionId === q.id);
            if(oind===-1) return res.status(422).json("non-existing option");
          }
          for(const o of qopts){
            const oind = qopts.findIndex((a) => a.optionId === o.id);
            if(oind>1) return res.status(422).json("more answers for the same option");
          }
        }
      }
      //create compil
      const compid = await data.addCompiling(req.body.surveyId, req.body.name);
      //create answers
      for(const a of answers){
        if(a["answer"]!==undefined){
          data.addOpenAnswer(compid, a["questionId"], a["answer"]);
        }else{
          for(const o of a["options"]){
            if(o["value"] === undefined) data.addClosedAnswer(compid, o["optionId"], 1)
            else if(o["value"] === true) data.addClosedAnswer(compid, o["optionId"], 1);
            else data.addClosedAnswer(compid, o["optionId"], 0);
          }
        }
      }
      return res.status(201).json("survey compiled correctly");
    } catch(err) {
      console.error(err);
      return res.status(503).json(err);
    }
}
);

// POST /api/surveys/new
app.post('/api/surveys/new', [
  check('title').isString().isLength({min: 1}),
  check('questions').isArray({min:1}),
  check('questions').custom((quest)=> {
    if(! Array.isArray(quest)) return false;
    for(let i=0; i<quest.length; i++){
        const ind = quest.findIndex((q) => q.position === i);
      if(ind===-1) return false;
    }
    for(const q of quest){
      if(q["options"]!==undefined){
        if(! Array.isArray(q["options"])) return false;
        if(q["options"].length<2) return false;
        if(q["options"].length>10) return false;
        for(const o of q["options"]){
          if(typeof o["text"] !== 'string') return false;
          if(o["text"].length===0) return false;
        }
        console.log(q);
        if(typeof q["min"] !== 'number') return false;
        if(q["min"]<0) return false;
        if(typeof q["max"] !== 'number') return false;
        if(q["max"]>10) return false;
        if(q["min"]>q["max"]) return false;
        if((q["min"]===q["max"])&&(q["min"]!==1)) return false;
      }
      else{
        if(q["required"]===undefined) return false;
        if(typeof q["required"] !== 'boolean') return false;
      }
      if(q["position"] === undefined) return false;
      if(q["text"] === undefined) return false;
      if(typeof q["position"] !== 'number' ) return false;
      if(typeof q["text"] !== 'string') return false;
      if(q["text"].length===0) return false;
    }
    return true;
  })],  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(422).json({errors: errors.array() });
    try{
      const surveyId = await data.addSurvey(req.user.id, req.body.title);
      for(const q of req.body.questions){
        if(q["options"]===undefined){
          await data.addOpenQuestion(surveyId, q.text, q.required, q.position+1);
        }
        else{
          const questionId = await data.addClosedQuestion(surveyId, q.text, q.min, q.max, q.position+1);
          for(const o of q["options"]){
            await data.addOption(questionId, o.text);
          }
        }
      }
      return res.status(201).json("survey added correctly");
    }
    catch(err) {
      console.error(err);
      return res.status(503).json(err);
    }
  }
  );