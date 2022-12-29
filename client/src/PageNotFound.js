import {Row, Col} from 'react-bootstrap';
function PageNotFound() {
    return(
        <>
            <Row className='notfoundsection'>
                    <Col sm={{span:8, offset:2}} md={{span:6, offset:3}}>
                     <h1 className='notfoundmessage'>404 - Page Not Found!</h1>
                    </Col>
            </Row>
        </>
    )
}

export default PageNotFound;