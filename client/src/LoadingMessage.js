import {Row, Col} from 'react-bootstrap';
function LoadingMessage() {
    return(
        <>
            <Row className='loadingsection'>
                    <Col sm={{span:8, offset:2}} md={{span:6, offset:3}}>
                     <h1 className='loadingmessage'>Loading...</h1>
                    </Col>
            </Row>
        </>
    )
}

export default LoadingMessage;