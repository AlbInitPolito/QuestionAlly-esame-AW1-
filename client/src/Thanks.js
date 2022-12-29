import {Row, Col, Button} from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
function Thanks() {
    const history = useHistory();

    const ret = () => {
        history.push({
            pathname: '/home',
            })
    }

    return(
        <>
            <Row className='thankssection'>
                <Col sm={{span:8, offset:2}} md={{span:6, offset:3}}>
                     <h1 className='thanksmessage'>Thanks for answering!</h1>
                    <Button variant="dark" type="submit" onClick={ret}>
                        Return home
                    </Button>
                </Col>
            </Row>
        </>
    )
}

export default Thanks;