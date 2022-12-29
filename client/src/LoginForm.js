import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import React, { useState } from "react";
import "./LoginForm.css";

function LoginForm(props) {
    const[username, setUsername] = useState('');
    const[password, setPassword] = useState('');
    const[error, setError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const credentials = {username: username, password: password};
        if(username==='')
            setError("Insert username!");
        else if(password==='')
            setError("Insert password!");
        else{
            setError('');
            props.login(credentials, setError);
        }
    }

    const changeUsername = (username) => {
        setError('');
        setUsername(username);
    }

    const changePassword = (password) => {
        setError('');
        setPassword(password);
    }

    return (<>
                <Row className='loginform'>
                    <Col sm={{span:8, offset:2}} md={{span:6, offset:3}}>
                        <h1 className='loginformtitle'>Login into QuestionAlly!</h1>
                        <Form>
                            <Form.Group controlId='username'>
                                <Form.Label>Username:</Form.Label>
                                <Form.Control value={username} onChange={ev => changeUsername(ev.target.value) }></Form.Control>
                            </Form.Group>
                            <Form.Group controlId='password'>
                                <Form.Label>Password:</Form.Label>
                                <Form.Control type='password' value={password} onChange={ev => changePassword(ev.target.value) }></Form.Control>
                            </Form.Group>
                            <div className='loginerrormessage'>
                            {error ? <Alert variant='danger'>{error}</Alert> : <Alert variant='white'></Alert>}
                            </div>
                            <Button onClick={handleSubmit} variant='dark'>Login</Button>
                        </Form>
                    </Col>
                </Row>
        </>
    )
}

export {LoginForm};