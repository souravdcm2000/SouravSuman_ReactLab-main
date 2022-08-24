import { useRef, useState, useEffect, useCallback, FormEvent } from 'react';
import { Container, Button, Spinner, Alert, Table, Modal, Form } from 'react-bootstrap';
import { getItems, addItem } from '../services/items';
import IItem from '../models/IItem';

const usersArray = [
    'Rahul',
    'Ramesh',
];

const ExpenseTracker = () => {
    const [ items, setItems ] = useState<IItem[]>( [] );
    const [ loading, setLoading ] = useState<boolean>( true );
    const [ error, setError ] = useState<Error | null>( null );

    const [debt, setDebt] = useState<number>(0);

    const [show, setShow] = useState<boolean>(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
  
    // 1. Initiate backend call after first render
    useEffect(() => {
      const fetchItems = async () => {
        try {
            const items = await getItems();
            setItems( items );  // 4. We are abled to use the items.
        } catch ( error ) {
            setError( error as Error )
        } finally {
            setLoading(false);
        }
      }

      fetchItems();
    }, []);

    const totalByPayee = useCallback(( payeeName : string ) => {
        const total = items.reduce(( sum, current ) => {
            if (current.payeeName.toLowerCase() === payeeName.toLowerCase()) {
                sum += current.price;
            }

            return sum;
        }, 0);

        return total;
    }, [items]);

    const debtCalculator = useCallback(() => {
        console.log('Called debtCalculator');
        const user1Total = totalByPayee( usersArray[0] );
        const user2Total = totalByPayee( usersArray[1] );

        const debt = (user1Total - user2Total) / 2;

        setDebt(debt);
    }, [totalByPayee]);

    useEffect(() => {
        debtCalculator();
    }, [debtCalculator]);

    const payeeNameRef = useRef<HTMLSelectElement>( null );
    const productRef = useRef<HTMLInputElement>( null );
    const priceRef = useRef<HTMLInputElement>( null );

    const addExpense = async ( event: FormEvent<HTMLFormElement> ) => {
        event.preventDefault();

        const expense = {
            payeeName: payeeNameRef?.current?.value as string,
            product: productRef?.current?.value as string,
            price: parseFloat ( priceRef?.current?.value as string ) as number,
            setDate: (new Date()).toISOString().substring( 0, 10 ) as string
        } as Omit<IItem, 'id'>;

        const updatedItem = await addItem( expense );
        console.log('updatedItem', updatedItem);

        setItems([ ...items, updatedItem ]);

        handleClose();
    };
    
    return (
        <Container className="my-4">
            <h1>
                Expense Tracker
                <Button
                    variant="primary"
                    className="float-end"
                    onClick={handleShow}
                >
                    Add Expense
                </Button>
            </h1>
            <hr />
            {
                loading && (
                    <div className="d-flex justify-content-center align-items-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                )
            }
            {
                !loading && error && (
                    <Alert variant="danger">{error.message}</Alert>
                )
            }
            {
                !loading && !error && (
                    <Table responsive="sm" striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Payee</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                items.map(
                                    ( item, idx ) => (
                                        <tr key={item.id}>
                                            <td>{idx + 1}</td>
                                            <td>{item.payeeName}</td>
                                            <td>{item.product}</td>
                                            <td>{item.setDate}</td>
                                            <td className="font-monospace text-end">{item.price}</td>
                                        </tr>
                                    )
                                )
                            }
                            {
                                usersArray.map(user => (
                                    <tr>
                                        <td colSpan={4} className="text-end">
                                            {user} Paid
                                        </td>
                                        <td className="text-end font-monospace">{totalByPayee( user )}</td>
                                    </tr>
                                ))
                            }
                            {
                                debt !== 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-end">
                                            {debt < 0 ? usersArray[0] : usersArray[1]} Owes
                                        </td>
                                        <td className="text-end font-monospace">{Math.abs(debt)}</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </Table>
                )
            }
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Expense</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={addExpense}>
                        <Form.Group className="mb-3" controlId="payeeName">
                            <Form.Label>Who Paid?</Form.Label>
                            <Form.Select aria-label="Payee Name" ref={payeeNameRef}>
                                <option>-- Select Payee --</option>
                                {
                                    usersArray.map(user => (
                                        <option value={user}>{user}</option>
                                    ))
                                }
                            </Form.Select>
                        </Form.Group>
                        
                        <Form.Group
                            className="mb-3"
                            controlId="product"
                        >
                            <Form.Label>For What?</Form.Label>
                            <Form.Control
                                type="text"
                                ref={productRef}
                            />
                        </Form.Group>

                        <Form.Group
                            className="mb-3"
                            controlId="price"
                        >
                            <Form.Label>How Much?</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                ref={priceRef}
                            />
                        </Form.Group>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                        <Button type="submit" variant="primary">
                            Save Changes
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ExpenseTracker;
