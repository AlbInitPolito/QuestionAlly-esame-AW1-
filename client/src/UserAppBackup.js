import { ListGroup, Col, Row, Form, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from "react"
import API from "./API"
import './UserApp.css';

function UserApp(props) {
    const [questionaries, setQuestionaries] = useState([])
    const [load, setLoad] = useState(true)
    const [qlist, setQlist] = useState([])

    useEffect( () => {
        if(load){
            props.setLoading(true);
            API.loadAllQuestionaries().then((q)=>setQuestionaries(q)).catch((e)=>{throw e});
            props.setLoading(false);
            setLoad(false);
        }
    },
        [load]
    );

    useEffect( () => {
        const newqlist = []
        for (const q of questionaries){
            newqlist.push(<NavLink to={"/compile/"+q.id} key={q.id} className="list-group-item" >
                {<QuestionaryLink questionary={q}/>}
            </NavLink>);
        }
        setQlist(newqlist);
    },
        [questionaries]
    );

    return(<>
            <Row className="hometitle" xs={{span: 6, offset: 3}}>
                <h2> Choose a questionary to compile:</h2>
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

function QuestionaryLink(props) {
    return(
        <Row>
            <Col xs="6">{props.questionary.title}</Col>
            <Col xs="6" className="questauthor">{"Author: "+props.questionary.author}</Col>
        </Row>
    )
}

function Filling(props) {
    const [loadq, setLoadq] = useState(true);
    const [loadf, setLoadf] = useState(true);
    const [questionary, setQuestionary] = useState(undefined);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);

    const handleSubmit = (event) => {
        event.preventDefault();
    }

    //if open only text is needed
    //if closed selected or not is needed for each option id
    const addAnswer = (position, type, content) => {
        setAnswers(oldanswers => {
        console.log(oldanswers);
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
            const optind = newanswers[aind]["options"].findIndex(o => o.optionId === content.optionId);
            if(optind === -1)
                newanswers[aind]["options"].push({optionId: content.optionId, value: content.value});
            else
                newanswers[aind]["options"][optind]["value"] = content.value;
            return (newanswers);
        }
        });
    }
 
    useEffect( () => {
        if(loadq){
            props.setLoading(true);
            API.loadQuestionary(props.questionaryId).then((q) => setQuestionary(q)).catch((e)=>{throw e});
            setLoadq(false);
        }
    },
        [loadq]
    );

    useEffect( () =>{
        if(loadf && (questionary !== undefined)){
            const newAnswers = [];
            for(let i=0; i<questionary.questions.length; i++){
                newAnswers.push({position: i+1, questionId: questionary.questions[i].question.id});
            }
            setAnswers(newAnswers);
            const newquestions = []
            for (const q of questionary.questions){
                if(q.question.options === undefined){ newquestions.push(
                    <Form.Group controlId={"opentext"+q.question.position} key={q.question.position}>
                        {q.question.required ? <Form.Label>{q.question.text + "***"}</Form.Label> 
                        : <Form.Label>{q.question.text}</Form.Label> 
                        }
                        <Form.Control type="text" placeholder="Type answer here" onChange={ev => { addAnswer(q.question.position, "open", ev.target.value); }}/>
                    </Form.Group>
                )}
                else{ 
                    const options = []
                    for (const o of q.question.options){
                        if(q.question.max === 1) { options.push( <Form.Check type="radio" label={o.text} key={o.id+"+"+q.question.position} id={o.id+"+"+q.question.position} onChange={ev => addAnswer(q.question.position, "closed", ev.target.value)} />)}
                        else{ options.push( <Form.Check type="checkbox" label={o.text} key={o.id+"+"+q.question.position} id={o.id+"+"+q.question.position} onChange={ev => addAnswer(q.question.position, "closed", {value: ev.target.value, optionId: o.id})}/> ) }
                    }
                    newquestions.push(
                        <Form.Group controlId={"closed"+q.question.position} key={q.question.position}>
                            <Form.Label>{
                                (q.question.min === 0) ? q.question.text+" max answers: "+q.question.max
                                : q.question.text+"***"+" max answers: "+q.question.max
                            }
                            </Form.Label>
                            {options}
                        </Form.Group> 
                        ); 
                    }
            }
            setQuestions(newquestions);
            setLoadf(false);
            props.setLoading(false);
        }
    },
        [loadf, questionary]
    );

    return(
        <>
            <Row className='questionarytop'>
                <Col xs="8" sm={{span:4,offset:2}}><h1 className='comptitle'>{questionary && questionary.title}</h1></Col>
                <Col xs="4" sm={{span:4,offset:2}} className="compauthor">{questionary && "Author: "+questionary.author}</Col>
            </Row>
            <Row className='mandalert'>
                <Col xs={{span:8, offset:2}} sm={{span:8, offset:3}} md={{span:8, offset:4}}>
                    Questions marked with *** are mandatory
                </Col>
            </Row>
            <Row className='questionaryform'>
                <Col sm={{span:8, offset:2}} md={{span:6, offset:3}}>
                    <Form>
                        <Form.Group controlId="usernamebar">
                            <Form.Label>Name:*** </Form.Label>
                            <Form.Control type="text" placeholder="Type your name here" />
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

export { UserApp, Filling };