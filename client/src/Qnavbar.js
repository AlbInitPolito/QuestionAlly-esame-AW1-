import { Navbar, Dropdown, Col } from 'react-bootstrap';
import { BsFillPersonFill } from 'react-icons/bs';
import React from 'react';
import { Link, NavLink, useHistory } from 'react-router-dom';

function Qnavbar(props) {

    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <a
          href="#"
          ref={ref}
          onClick={(e) => {
            e.preventDefault();
            onClick(e);
          }}
        >
          {children}
          
        </a>
      ));

      const history = useHistory();
      
      const handleLogout = () => {
        props.logout();
        history.push({
          pathname: '/home',
        })
      }

      return (
        <Navbar bg="dark" variant="dark" className="d-flex justify-content-between" expand="sm">
            <Col xs={{span:3, offset:4}} md={{span:4, offset:4}}>
                <Link to="/home">
                    <Navbar.Brand>QuestionAlly</Navbar.Brand>
                </Link>
            </Col>
            {
                props.loggedIn ? <>
                <Dropdown>
                    <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                        <BsFillPersonFill size={25} color="#f8f9fa" />
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="dropdown-menu-right">
                        <Dropdown.Header>{props.username}</Dropdown.Header>
                        <Dropdown.Item onClick={handleLogout} className="logout-button">
                            Logout
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                </>
                : <NavLink to="/login" className="loginbutton">
                    <BsFillPersonFill size={25} color="#light-grey" />
                  </NavLink>
            }
        </Navbar>
      );
}

export default Qnavbar;