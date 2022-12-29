import { ListGroup, Col, Row, Form, Button, Modal, Alert } from 'react-bootstrap';
import { NavLink, useHistory } from 'react-router-dom';
import { useEffect, useState } from "react"
import API from "./API"
import './AdminApp.css';

function AdminApp(props) {
    const [surveys, setSurveys] = useState([])
    const [load, setLoad] = useState(true)
    const [qlist, setQlist] = useState([])

    const history = useHistory();

    useEffect( () => {
        if(load){
            props.setLoading(true);
            API.loadUserSurveys().then((q)=>setSurveys(q)).catch((e)=>{throw e});
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
                    newqlist.push(<NavLink to={"/dashboard/check/"+q.id} key={q.id} className="list-group-item" >
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
            <h2>{"Welcome "+props.username+"!"}</h2>
        </Row>
        <Row className="hometitle" xs={{span: 6, offset: 3}}>
            <h2>Your surveys:</h2>
        </Row>
        <Row>
            <Col xs="12" sm={{span: 8, offset: 2}} xl={{span: 6, offset: 3}}>
                <ListGroup>
                    {qlist}
                </ListGroup>
            </Col>
        </Row>
        <NavLink to={"/new/"}>
            { <Button className="btn-circle" variant="secondary" size="lg">+</Button>}
        </NavLink>;
        {//<Button className="btn-circle" variant="secondary" size="lg">+</Button>
        }
        </>
    )
}


function SurveyLink(props) {
    return(
        <Row>
            <Col xs="6">{props.survey.title}</Col>
            <Col xs="6" className="questauthor">{"Compiled: "+props.survey.number+" times"}</Col>
        </Row>
    )
}

function AdminCheck(props){
    const [load, setLoad] = useState(true)
    const [answers, setAnswers] = useState([]);
    const [selected, setSelected] = useState(0);
    const [loadedAnswers, setLoadedAnswers] = useState([]);
    const [name, setName] = useState("");

    useEffect( () => {
        if(load){
            props.setLoading(true);
            API.loadSurveyAnswers(props.surveyId).then((q)=>setAnswers(q)).catch((e)=>{throw e});
            props.setLoading(false);
            setLoad(false);
        }
    },
        [load]
    );

    const nextCompiling = () => {
        setSelected((oldsel) => {
            if(selected+1 < answers.length){
                //setLoadedAnswers([]);
                return(oldsel+1);
            }
            else return oldsel;
        });
    }

    const prevCompiling = () => {
        if(selected > 0){
            //setLoadedAnswers([]);
            setSelected((oldsel) => oldsel-1);
        }
    }

    useEffect( () =>{
            if(answers.length>0){
                const newLoadedAnswers = []
                setName(answers[selected].name);
                const questions = answers[selected].questions;
                for (const q of questions){
                    if(q.question.options === undefined){ newLoadedAnswers.push( <OpenQuestion question={q.question} key={q.position}/>); }
                    else{ newLoadedAnswers.push( <ClosedQuestion question={q.question} key={q.position}/> ); }
                }
                setLoadedAnswers(newLoadedAnswers);
            }
    },
        [selected, answers]
    );

    return(
        <>
         <Row className='surveytop'>
                <Col sm={{span:10, offset:2}} md={{span:9, offset:3}}><h1 className='comptitle'>{answers.length>0 && answers[selected].title}</h1></Col>
        </Row>
        <Row className='surveyform'>
            <Col sm={{span:8, offset:2}} md={{span:6, offset:3}}>
                <Form>
                    <Form.Group controlId="usernamebar">
                        <Form.Label>Name: </Form.Label>
                        <Form.Control type="text" defaultValue={name} disabled/>
                    </Form.Group>
                    {loadedAnswers}
                </Form>
            </Col>
        </Row>
        <Row className='navigationbuttons'>
            <Col xs={{span:1, offset:3}} sm={{span: 1, offset:4}}>
                { selected === 0 ? <Button className='navbutton' variant='secondary' onClick={prevCompiling} disabled> Prev </Button>
                : <Button className='navbutton' variant='secondary' onClick={prevCompiling}> Prev </Button> }
            </Col>
            <Col xs={{span:1, offset:4}} sm={{span:1, offset:3}}>
                { selected === answers.length-1 ? <Button className='navbutton' variant='secondary' onClick={nextCompiling} disabled> Next </Button>
                : <Button className='navbutton' variant='secondary' onClick={nextCompiling}> Next </Button> }
            </Col>
        </Row>
        </>
    );
}

function OpenQuestion(props) {
    //const [question, setQuestion] = useState(props.question);
    return(
        <Form.Group controlId={"opentext"+props.question.position}>
            <Form.Label>{props.question.text}</Form.Label>
            <Form.Control type="text" defaultValue={props.question.answer} disabled/>
        </Form.Group>
    )
}

function ClosedQuestion(props) {
    //const[question, setQuestion] = useState(props.question);
    const[options, setOptions] = useState([])
    const[load, setLoad] = useState(true)

    useEffect( () =>{
        if(load){
            const newoptions = []
            for (const o of props.question.options){
                let sel = false;
                if(o.value===1) sel=true;
                if(props.question.max === 1) { newoptions.push( <Form.Check type="radio" disabled label={o.text} defaultChecked={sel} key={o.id+"+"+props.question.position} name={props.question.position} className="readonlycheck"/>)}
                else{
                     newoptions.push( <Form.Check type="checkbox" disabled label={o.text} key={o.id+"+"+props.question.position} defaultChecked={sel} className="readonlycheck"/> ) 
                    }
            }
            setOptions(newoptions);
            setLoad(false);
        }
    },
        [load]
    );

    return(
        <Form.Group controlId={"closed"+props.question.position}>
                <Form.Label> {props.question.text} </Form.Label>
                {options}
        </Form.Group>
    )
}

function AdminAdd(props){
    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState([]);
    const [loadedQuestions, setLoadedQuestions] = useState([]);
    const [show, setShow] = useState(false);
    const [showOpen, setShowOpen] = useState(false);
    const [showClosed, setShowClosed] = useState(false);
    const [mode, setMode] = useState(undefined);
    const [load, setLoad] = useState(true);
    const [sendError, setSendError] = useState("");

    const [text, setText] = useState("");
    const [required, setRequired] = useState(false);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(10);
    const [options, setOptions] = useState([]);
    const [optionl, setOptionl] = useState([]);
    const [missing, setMissing] = useState(false);
    const [error, setError] = useState("");

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleOpenClose = () => { setShowOpen(false); }
    const handleOpenShow = () => { handleClose(); 
        setMode(oldmode => {
            if(oldmode === "closed"){
                setText("");
                setRequired(false);
                setMax(10);
                setMin(0);
                setLoad(true);
            }
            setMode("open");
        })
        setShowOpen(true); 
    }

    const handleClosedClose = () => { setShowClosed(false); }
    const handleClosedShow = () => { 
        handleClose(); 
        setMode(oldmode => {
            if(oldmode === "open"){
                setText("");
                setRequired(false);
                setMax(10);
                setMin(0);
                setLoad(true);
            }
            setMode("closed");
        })
        setShowClosed(true); 
    }

    const history = useHistory();

    const success = () => {
        history.push({
            pathname: '/done',
            state: { red: true }
            })
    }

    const abort = () => {
        history.push({
            pathname: '/aborted',
            state: { red: true, message: "500 - Internal Server Error" }
            })
    }

    const addQuestion = () => {
        if(text !== ""){
            setQuestions((oldquestions) => {
                const newquestions = [...oldquestions];
                if(mode==="open"){
                    newquestions.push({ text: text, required: required, position: oldquestions.length});
                    setShowOpen(false);
                    setText("");
                    setRequired(false);
                    setMax(0);
                    setMin(0);
                }else{
                    const newoptions = [];
                    const actualoptions = options.filter((o) => o.text!=="");
                    if(actualoptions.length<max) setError("Written options are less than max!");
                    else if(min>max) setError("Min must be less than max, or both must be 1!");
                    else if((min===max)&&(min!=='1')) setError("Min must be less than max, or both must be 1!")
                    else if(actualoptions.length<2) setError("Write at least two options!");
                    else{
                        for(const o of actualoptions){
                            newoptions.push({text: o.text});
                        }
                        setError("");
                        newquestions.push({ text: text, options: newoptions, min: parseInt(min, 10), max: parseInt(max, 10), position: oldquestions.length })
                        setShowClosed(false);
                        setText("");
                        setRequired(false);
                        setMax(0);
                        setMin(0);
                        setLoad(true);
                    }
                }
                return newquestions;
            });
        }
        else setMissing(true);
    }

    useEffect ( () => {
        if(load){
            const newoptions = [];
            for(let i=0; i<10; i++){
                newoptions.push({num: i, text: ""});
            }
            setOptions(newoptions);
            setLoad(false);
        }
    },
        [load]
    );

    const setOption = (num, newtext) => {
        setOptions((oldoptions) => {
            const newoptions = [...oldoptions];
            const newoption = {num: num, text: newtext};
            newoptions[num] = newoption;
            return newoptions;
        });
    }

    useEffect( () => {
        const newoptionl = []
        for(const o of options){
            newoptionl.push(
                <Form.Group controlId={"option"+o.num} key={"option"+o.num}>
                    <Form.Label>{"Option"+(o.num+1)+":"}</Form.Label>
                    <Form.Control type="text" value={options[o.num].text} required isInvalid={missing} onChange={(ev)=>{
                        setOption(o.num, ev.target.value); setMissing(false);} } />
                </Form.Group>
            );
        }
        setOptionl(newoptionl);
    },
        [options, missing]
    );

    useEffect( () => {
        if(max<1) setMax(1);
        if(max>10) setMax(10);
    },
    [max]
    )

    useEffect( () => {
        if(min<0) setMin(0);
        if(min>9) setMin(9);
    },
    [min]
    )

    const moveUp = (position) => {
        if(position!==0){
            setQuestions((oldquestions) => {
                const newquestions = [...oldquestions];
                newquestions[position-1].position = position
                newquestions[position].position = position-1
                newquestions.sort((a,b) => { return a.position-b.position; })
                return newquestions;
            });
        }
    }

    const moveDown = (position) => {
        setQuestions((oldquestions) => {
            if(position!==questions.length-1){
                const newquestions = [...oldquestions];
                newquestions[position].position = position+1
                newquestions[position+1].position = position
                newquestions.sort((a,b) => { return a.position-b.position; })
                return newquestions;
            }
            return oldquestions;
        });
    }

    const deleteQuestion = (position) => {
        setQuestions((oldquestions) => {
            let newquestions = [...oldquestions];
            newquestions.splice(position, 1);
            newquestions = newquestions.map((q,i) => {
                const newq = {...q};
                newq.position = i;
                return  newq;
            })
            /*
            newquestions = newquestions.map((q) => {
                if(q.position > position) q.position = q.position-1;
                return q;
            });
            */
            return newquestions;
        })
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if(title === "") setSendError("Please insert the title!");
        else if(loadedQuestions.length===0) setSendError("Please add at least one question!");
        else{ 
            setSendError("");
            props.addSurvey(title, questions, success, abort);
        }
    }

    useEffect( () =>{
            const newloadedquestions = []
            for (const q of questions){
                if(q.options === undefined){ 
                    newloadedquestions.push( 
                        <Row key={q.position}>
                            <Col xs="9">
                                <Form.Group controlId={"opentext"+q.position} key={q.position}>
                                    {q.required ? <Form.Label>{q.text+" (required)"}</Form.Label>
                                    : <Form.Label>{q.text}</Form.Label>
                                    }
                                    <Form.Control type="text" defaultValue={""} disabled/>
                                </Form.Group>
                            </Col>
                            <Col xs="3">
                                <Form.Label>Move or delete:</Form.Label>
                                <Form.Group controlId={"commands"+q.position} key={"commands"+q.position}>
                                    <Button variant="danger" onClick={()=>deleteQuestion(q.position)}>X</Button>
                                    <Button variant="success" onClick={()=>moveUp(q.position)}>Up</Button>
                                    <Button variant="success" onClick={()=>moveDown(q.position)}>Down</Button>
                                </Form.Group>
                            </Col>
                        </Row>
                    ); 
                }
                else{
                    const newoptions = [];
                    for (const o of q.options){
                        if(q.max === 1) { newoptions.push( <Form.Check type="radio" disabled label={o.text} key={o.text+"+"+q.position} className="readonlycheck"/>)}
                        else{
                             newoptions.push( <Form.Check type="checkbox" disabled label={o.text} key={o.text+"+"+q.position} className="readonlycheck"/> ) 
                            }
                    }
                    newloadedquestions.push(
                        <Row key={q.position}>
                            <Col xs="9">
                                <Form.Group controlId={"closed"+q.position}>
                                    <Form.Label> {q.text+" min: "+q.min+" max: "+q.max} </Form.Label>
                                    {newoptions}
                                </Form.Group>
                            </Col>
                            <Col xs="3">
                                <Form.Label>Move or delete:</Form.Label>
                                <Form.Group controlId={"commands"+q.position} key={"commands"+q.position}>
                                    <Button variant="danger" onClick={()=>deleteQuestion(q.position)}>X</Button>
                                    <Button variant="success" onClick={()=>moveUp(q.position)}>Up</Button>
                                    <Button variant="success" onClick={()=>moveDown(q.position)}>Down</Button>
                                </Form.Group>
                            </Col>
                        </Row>
                    )
                }
            }
            setLoadedQuestions(newloadedquestions);
    },
        [questions]
    );

    return(
        <>
            <Row className='surveyalert'>
                <Col sm={{span:10, offset:1}} md={{span:8, offset:2}}>
                    {sendError ? <Alert variant='danger'>{sendError}</Alert> : <Alert variant='white'></Alert>}
                </Col>
            </Row>
            <Row className='surveyform'>
                <Col sm={{span:10, offset:1}} md={{span:8, offset:2}}>
                    <Form>
                        <Form.Group controlId="titlebar">
                            <Form.Label>Title: </Form.Label>
                            <Form.Control type="text" value={title} onChange={(ev)=>setTitle(ev.target.value)} />
                        </Form.Group>
                        {loadedQuestions}
                    </Form>
                </Col>
            </Row>
            <Row>
                <Col xs={{span:5, offset:0}} md={{span:4, offset:0}}>
                    <Button className="btn-end" variant="secondary" size="lg" onClick={handleShow}>Add question</Button>
                </Col>
                <Col xs={{span:5, offset:0}}>
                    <Button className="btn-end" variant="secondary" onClick={handleSubmit}>Save survey</Button>
                </Col>
           </Row>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                <Modal.Title>Choose a question type</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col xs="5">
                            <Button variant="secondary" onClick={handleOpenShow}> Open question </Button>
                        </Col>
                        <Col xs={{span:5, offset:2}}>
                            <Button variant="secondary" onClick={handleClosedShow}> Closed question </Button>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>

            <Modal show={showOpen} onHide={handleOpenClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create question:</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="textbar">
                            <Form.Label>Question: </Form.Label>
                            <Form.Control type="text" value={text} required isInvalid={missing} onChange={(ev)=>{
                                setText(ev.target.value); setMissing(false);} } />
                            <Form.Control.Feedback type="invalid">
                                Please enter the question text
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="requiredcheck">
                            <Form.Check type="checkbox" label="Required" checked={required} onChange={ev => setRequired(ev.target.checked)}/>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={addQuestion}>Add question</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showClosed} onHide={handleClosedClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create question:</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="textbar">
                            <Form.Label>Question: </Form.Label>
                            <Form.Control type="text" value={text} required isInvalid={missing} onChange={(ev)=>{
                                setText(ev.target.value); setMissing(false);} } />
                            <Form.Control.Feedback type="invalid">
                                Please enter the question text
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="minmaxcheck">
                            <Form.Label>Minimum selections required: </Form.Label>
                            <Form.Control type="number" value={min} isInvalid={error!==""} onChange={ev => setMin(ev.target.value)}/>
                            <Form.Label>Maximum selections allowed: </Form.Label>
                            <Form.Control type="number" value={max} isInvalid={error!==""} onChange={ev => setMax(ev.target.value)}/>
                            <Form.Control.Feedback type="invalid">
                                {error}
                            </Form.Control.Feedback>
                        </Form.Group>
                        {optionl}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={addQuestion}>Add question</Button>
                </Modal.Footer>
            </Modal>
        </>
        );
}

export { AdminApp, AdminCheck, AdminAdd };