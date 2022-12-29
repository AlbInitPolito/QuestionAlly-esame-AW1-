import { ListGroup, Col, Row, Form, Button, Alert } from 'react-bootstrap';
import { NavLink, useHistory } from 'react-router-dom';
import { useEffect, useState } from "react"
import API from "./API"
import './UserApp.css';

function UserApp(props) {
    const [surveys, setSurveys] = useState([])
    const [load, setLoad] = useState(true)
    const [qlist, setQlist] = useState([])

    const history = useHistory();

    useEffect( () => {
        if(load){
            props.setLoading(true);
            API.loadAllSurveys().then((q)=>setSurveys(q)).catch((e)=>{throw e});
            props.setLoading(false);
            setLoad(false);
        }
    },
        [load]
    );

    useEffect( () => {
        const newqlist = []
        if(surveys!==undefined){
            for (const q of surveys){
                newqlist.push(<NavLink to={"/compile/"+q.id} key={q.id} className="list-group-item" >
                    {<SurveyLink survey={q}/>}
                </NavLink>);
            }
            setQlist(newqlist);
        }
        else{
            history.push({
                pathname: '/aborted',
                state: { red: true, message: "503 - Service Unavailable" }
              })
        }
    },
        [surveys]
    );

    return(<>
            <Row className="hometitle" xs={{span: 6, offset: 3}}>
                <h2> Choose a survey to compile:</h2>
            </Row>
            <Row>
                <Col xs="12" sm={{span: 8, offset: 2}} xl={{span: 6, offset: 3}}>
                    <ListGroup>
                        {qlist}
                    </ListGroup>
                </Col>
            </Row>
        </>
    )

}

function SurveyLink(props) {
    return(
        <Row>
            <Col xs="6">{props.survey.title}</Col>
            <Col xs="6" className="questauthor">{"Author: "+props.survey.author}</Col>
        </Row>
    )
}

function Filling(props) {
    const [loadq, setLoadq] = useState(true);
    const [loadf, setLoadf] = useState(true);
    const [survey, setSurvey] = useState(undefined);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const history = useHistory();

    const handleSubmit = (event) => {
        event.preventDefault();
        let err = false;
        if(name === ""){
            setError("Please, insert your name!");
            err=true;
            window.scrollTo(0, 0);
        }
        if(err===false){
            setError("");
            let aind = -1;
            for(const q of survey.questions){
                aind = answers.findIndex( a => a.position === q.position);
                if((q.question.required===1)||(q.question.min===1)){
                    if((answers[aind]["answer"]===undefined)&&(answers[aind]["options"]===undefined)){
                        err=true;
                        setError("Please, answer all the required questions!");
                        window.scrollTo(0, 0);
                        break;
                    }
                }
                if((q.question.max!==undefined)&&(answers[aind]["options"]!==undefined)){
                    const quantity = answers[aind]["options"].filter((o)=>o.value === true);
                    if(q.question.max<quantity.length){
                        err=true;
                        setError("Please, don't exceed the maximum possible answers to closed questions!");
                        window.scrollTo(0, 0);
                        break;
                    }
                    if(q.question.min>answers[aind]["options"].length){
                        err=true;
                        setError("Please, select at least the minimum required options!")
                    }
                }
            }
        }
        if(err===false){
            setError("");
            const resanswers = answers.filter((a) => {
                if((a["answer"]===undefined)&&(a["options"]===undefined)) return false; return true;
            });
            props.addCompiling(survey.id, name, resanswers, success, abort);
        }
    }

    const success = () => {
        history.push({
            pathname: '/thanks',
            state: { red: true }
            })
    }

    const abort = () => {
        history.push({
            pathname: '/aborted',
            state: { red: true, message: "500 - Internal Server Error" }
            })
    }

//if open only text is needed
    //if closed selected or not is needed for each option id
    const addAnswer = (position, type, content) => {
        setAnswers(oldanswers => {
        if(type==="open"){
            const newanswers = [...oldanswers];
            let aind = newanswers.findIndex( a => a.position === position);
            /*
            if(aind === -1){
                newanswers.push({position: position});
                aind = newanswers.findIndex( a => a.position === position);
            }*/
            if(content === "") newanswers[aind]["answer"] = undefined;
            else newanswers[aind]["answer"] = content;
            return (newanswers);
        }
        else if(type==="closed"){
            const newanswers = [...oldanswers];
            let aind = newanswers.findIndex( a => a.position === position);
            /*
            if(aind === -1){
                newanswers.push({position: position});
                aind = newanswers.findIndex( a => a.position === position);
            }*/
            if(newanswers[aind]["options"]===undefined) newanswers[aind]["options"] = []
            if(content.single === true){
                newanswers[aind]["options"] = []
                newanswers[aind]["options"].push({optionId: content.optionId});
            }
            else{
                const optind = newanswers[aind]["options"].findIndex(o => o.optionId === content.optionId);
                if(optind === -1)
                    newanswers[aind]["options"].push({optionId: content.optionId, value: content.value});
                else
                    newanswers[aind]["options"][optind]["value"] = content.value;
                const checkind = newanswers[aind]["options"].findIndex(o => o.value === true);
                if(checkind === -1) newanswers[aind]["options"] = undefined;
            }
            return (newanswers);
        }
        });
    }
 
    useEffect( () => {
        if(loadq){
            props.setLoading(true);
            API.loadSurvey(props.surveyId).then((q) => setSurvey(q)).catch((e)=>{throw e});
            setLoadq(false);
        }
    },
        [loadq]
    );

    useEffect( () =>{
        if(loadf && (survey !== undefined)){
            
            const newAnswers = [];
            for(let i=0; i<survey.questions.length; i++){
                newAnswers.push({position: i+1, questionId: survey.questions[i].question.id});
            }
            setAnswers(newAnswers);

            const newquestions = []
            for (const q of survey.questions){
                if(q.question.options === undefined){ newquestions.push( <OpenQuestion question={q.question} key={q.position} addAnswer={addAnswer}/>); }
                else{ newquestions.push( <ClosedQuestion question={q.question} key={q.position} addAnswer={addAnswer}/> ); }
            }
            setQuestions(newquestions);
            setLoadf(false);
            props.setLoading(false);
        }
    },
        [loadf, survey]
    );

    return(
        <>
            <Row className='surveytop'>
                <Col xs="8" sm={{span:4,offset:2}} xl={{span:6, offset:2}}><h1 className='comptitle'>{survey && survey.title}</h1></Col>
                <Col xs="4" sm={{span:4,offset:2}} xl={{span:4, offset:0}} className="compauthor">{survey && "Author: "+survey.author}</Col>
            </Row>
            <Row className='mandalert'>
                <Col xs={{span:8, offset:2}} sm={{span:8, offset:3}} md={{span:8, offset:4}}>
                    Questions marked with *** are mandatory
                </Col>
            </Row>
            <Row>
                <Col xs={12} sm={{span:8, offset:2}} md={{span:6, offset:3}} >
                    {error ? <Alert variant='danger'>{error}</Alert> : <Alert variant='white'></Alert>}
                </Col>
            </Row>
            <Row className='surveyform'>
                <Col sm={{span:8, offset:2}} md={{span:6, offset:3}}>
                    <Form>
                        <Form.Group controlId="usernamebar">
                            <Form.Label>Name:*** </Form.Label>
                            <Form.Control type="text" placeholder="Type your name here" onChange={ev => { setName(ev.target.value)}}/>
                        </Form.Group>
                        {questions}
                        <Button variant="dark" type="submit" onClick={handleSubmit}>
                            Submit
                        </Button>
                    </Form>
                </Col>
            </Row>
        </>
    )
}

function OpenQuestion(props) {
    const setAnswer = (text) => {
        props.addAnswer(props.question.position, "open", text);
    }

    return(
        <Form.Group controlId={"opentext"+props.question.position}>
            {props.question.required ? <Form.Label>{props.question.text + "***"}</Form.Label> 
            : <Form.Label>{props.question.text}</Form.Label> 
            }
            <Form.Control type="text" placeholder="Type answer here" onChange={ev => { setAnswer(ev.target.value); }}/>
        </Form.Group>
    )
}

function ClosedQuestion(props) {
    const[options, setOptions] = useState([])
    const[load, setLoad] = useState(true)

    const setAnswer = (value) => {
        props.addAnswer(props.question.position, "closed", value);
    }

    useEffect( () =>{
        if(load){
            const newoptions = []
            for (const o of props.question.options){
                if(props.question.max === 1) { newoptions.push( <Form.Check type="radio" label={o.text} key={o.id+"+"+props.question.position} id={o.id+"+"+props.question.position} name={props.question.position} onChange={ev => setAnswer({value: ev.target.checked, optionId: o.id, single: true}) } />)}
                else{ newoptions.push( <Form.Check type="checkbox" label={o.text} key={o.id+"+"+props.question.position} id={o.id+"+"+props.question.position}  onChange={ev => setAnswer({value: ev.target.checked, optionId: o.id, single: false}) }/> ) }
            }
            setOptions(newoptions);
            setLoad(false);
        }
    },
        [load]
    );

    return(
        <Form.Group controlId={"closed"+props.question.position}>
                <Form.Label>{
                (props.question.min === 0) ? props.question.text+" max answers: "+props.question.max
                : props.question.text+" min answers: "+props.question.min+" max answers: "+props.question.max
                }
                </Form.Label>
                {options}
        </Form.Group>
    )
}


export { UserApp, Filling };