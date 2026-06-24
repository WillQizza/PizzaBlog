import { NextResponse } from "next/server";

const pizzas = [
	{ slug: "hawaiian", name: "Hawaiian", topping: "Tomato, mozzarella, ham, pineapple" }
];

export async function GET() {
	return NextResponse.json({ pizzas });
}
