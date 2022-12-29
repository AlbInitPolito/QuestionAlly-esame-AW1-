import {Row, Col} from 'react-bootstrap';
function Aborted(props) {
    return(
        <>
            <Row className='abortedsection'>
                    <Col sm={{span:8, offset:2}} md={{span:6, offset:3}}>
                     <h1 className='abortedmessage'>{props.message}</h1>
                    </Col>
            </Row>
        </>
    )
}

export default Aborted;