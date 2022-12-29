import {Row, Col, Button} from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
function Done() {
    const history = useHistory();

    const ret = () => {
        history.push({
            pathname: '/dashboard',
            })
    }

    return(
        <>
            <Row className='donesection'>
                <Col sm={{span:8, offset:2}} md={{span:6, offset:3}}>
                     <h1 className='donemessage'>Your survey has been created succesfully!</h1>
                    <Button variant="dark" type="submit" onClick={ret}>
                        Return to dashboard
                    </Button>
                </Col>
            </Row>
        </>
    )
}

export default Done;