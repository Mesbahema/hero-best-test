import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import { useCryptoData } from '@/hooks/useCryptoData';
import { Skeleton } from '@mui/material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        // backgroundColor: theme.palette.common.black,
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));



export default function DataTable() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const { coins, total, loading } = useCryptoData(page * rowsPerPage + 1, rowsPerPage);

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Rank</StyledTableCell>
                        <StyledTableCell align="right">Name</StyledTableCell>
                        <StyledTableCell align="right">Symbol</StyledTableCell>
                        <StyledTableCell align="right">Price USD</StyledTableCell>
                        <StyledTableCell align="right">Price BTC</StyledTableCell>
                        <StyledTableCell align="right">24h</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(loading || !coins.length) ?

                        Array.from({ length: rowsPerPage }, (_, i) => (
                            <StyledTableRow key={i}>
                                <StyledTableCell component="th" scope="row">
                                    <Skeleton animation="wave" />

                                </StyledTableCell>
                                <StyledTableCell align="right"><Skeleton animation="wave" />
                                </StyledTableCell>
                                <StyledTableCell align="right"><Skeleton animation="wave" />
                                </StyledTableCell>
                                <StyledTableCell align="right"><Skeleton animation="wave" />
                                </StyledTableCell>
                                <StyledTableCell align="right"><Skeleton animation="wave" />
                                </StyledTableCell>
                                <StyledTableCell align="right"> <Skeleton animation="wave" />
                                </StyledTableCell>
                            </StyledTableRow>
                        ))

                        : coins.map((row) => (
                            <StyledTableRow key={row.symbol}>
                                <StyledTableCell component="th" scope="row">
                                    {row.cmcRank}
                                </StyledTableCell>
                                <StyledTableCell align="right">{row.name}</StyledTableCell>
                                <StyledTableCell align="right">{row.symbol}</StyledTableCell>
                                <StyledTableCell align="right">${row.priceUsd && row.priceUsd.toFixed(2)}</StyledTableCell>
                                <StyledTableCell align="right">₿{row.priceBtc && row.priceBtc.toFixed(5)}</StyledTableCell>
                                <StyledTableCell sx={{
                                    fontWeight: 'bold',
                                    color: row.change24h && row.change24h > 0 ? 'success.main' : 'error.main'
                                }} align="right"> {row.change24h && row.change24h.toFixed(2)}%</StyledTableCell>
                            </StyledTableRow>
                        ))}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </TableContainer>
    );
}