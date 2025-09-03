"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Loadingpage from "@/loadingpages/loadingpage";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";

export default function Cart() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Loadingpage />;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-400" />
        <h1 className="mt-4 text-2xl font-semibold">Seu carrinho está vazio</h1>
        <p className="mt-2 text-gray-500">
          Faça login para visualizar e gerenciar seus itens.
        </p>
        <Button color="primary" className="mt-6 rounded-xl px-6">
          Fazer Login
        </Button>
      </div>
    );
  }

  // Exemplo de produtos mockados (depois você pode substituir pela sua API/database)
  const cartItems = [
    {
      id: 1,
      name: "Fone Bluetooth",
      price: 199.9,
      image: "https://via.placeholder.com/300",
    },
    {
      id: 2,
      name: "Smartwatch",
      price: 349.9,
      image: "https://via.placeholder.com/300",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Seu Carrinho</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cartItems.map((item) => (
          <Card key={item.id} shadow="sm" className="rounded-2xl">
            <CardHeader className="p-0 relative w-full h-48">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover rounded-t-2xl"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </CardHeader>
            <CardBody>
              <h2 className="text-lg font-semibold">{item.name}</h2>
              <p className="text-gray-600">R$ {item.price.toFixed(2)}</p>
            </CardBody>
            <CardFooter className="flex justify-between items-center">
              <Button
                variant="light"
                color="danger"
                isIconOnly
                className="rounded-full"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
              <Button color="primary" className="rounded-xl px-4">
                Comprar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Resumo do carrinho */}
      <div className="mt-10 max-w-lg mx-auto bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Resumo da Compra</h2>
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span>
            R$ {cartItems.reduce((acc, item) => acc + item.price, 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-gray-700 mt-2">
          <span>Frete</span>
          <span>R$ 20,00</span>
        </div>
        <hr className="my-4" />
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>
            R${" "}
            {(
              cartItems.reduce((acc, item) => acc + item.price, 0) + 20
            ).toFixed(2)}
          </span>
        </div>
        <Button
          color="success"
          className="w-full mt-6 rounded-xl py-3 font-semibold"
        >
          Finalizar Compra
        </Button>
      </div>
    </div>
  );
}